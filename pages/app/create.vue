<template>
    <main class="flex flex-col p-6 justify-between h-[100vh] pb-24">
        <div>
            <h1 class="text-xl mb-4 font-bold">Create new Record</h1>
        <div class="flex flex-col gap-4">
            <input class="border-1 rounded-lg p-2" type="text" placeholder="Title" v-model="newTitle">
            <input class="border-1 rounded-lg p-2" type="text" placeholder="Description" v-model="newDescription">
            <div class="flex flex-row justify-start gap-4">
                <input class="checkbox" v-model="newIsPublic" type="checkbox" name="Public" id="">
                <p>Is Public?</p>
            </div>            
            <div class="form-control w-full">
                <label class="label">
                    <span class="label-text">Upload Image</span>
                </label>
                <input 
                    type="file" 
                    accept="image/*"
                    class="file-input file-input-bordered w-full" 
                    @change="handleFileChange" 
                />
                <div v-if="imagePreview" class="mt-4">
                    <p class="text-sm mb-2">Preview:</p>
                    <img :src="imagePreview" alt="Preview" class="max-w-xs rounded-lg" />
                </div>
            </div>
        </div>
        </div>
        
        
        <button 
            @click="handleCreate" 
            class="btn btn-primary "
            :disabled="isUploading"
        >
            <span v-if="isUploading">
                <span class="loading loading-spinner loading-sm mr-2"></span>
                Uploading...
            </span>
            <span v-else>Create Record</span>
        </button>
        
        <BottomNav />
    </main>
</template>

<script setup>
import { v4 as uuidv4 } from 'uuid';

const newTitle = ref("");
const newDescription = ref("");
const newIsPublic = ref(false)
const selectedFile = ref(null);
const imagePreview = ref(null);
const isUploading = ref(false);

const supabase = useSupabase();

const getUserSession = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
        console.error("ERROR: ", error);
    } else {
        return data.session;
    }
};

const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    selectedFile.value = file;
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
        imagePreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
};

const uploadImage = async (file) => {
    if (!file) return null;
    const session = await getUserSession()
    const userId = session.user.id 
    // Generate UUID for the file
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file);
    
    if (error) {
        console.error("Error uploading image:", error);
        return null;
    }
    
    // Return the public URL
    const { data: publicUrlData } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);
    
    return publicUrlData.publicUrl;
};

const handleCreate = async () => {
    if (!newTitle.value || !newDescription.value) {
        alert("Please enter a title and description");
        return;
    }
    
    try {
        isUploading.value = true;
        const session = await getUserSession();
        const userId = session.user.id;
        
        // Upload image if selected
        let imageUrl = null;
        if (selectedFile.value) {
            imageUrl = await uploadImage(selectedFile.value);
        }
        
        // Create record in database
        const { error } = await supabase.from("motions").insert({
            title: newTitle.value,
            description: newDescription.value,
            public: newIsPublic.value,
            image: imageUrl || null,
            creator_id: userId
        });
        
        if (error) {
            console.error(error);
            alert("Failed to create record");
        } else {
            // Reset form
            newTitle.value = "";
            newDescription.value = "";
            selectedFile.value = null;
            imagePreview.value = null;
            
            // Navigate to home
            navigateTo('/app');
        }
    } catch (err) {
        console.error("Error creating record:", err);
        alert("An error occurred while creating the record");
    } finally {
        isUploading.value = false;
    }
};
</script>
