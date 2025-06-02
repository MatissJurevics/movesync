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
                    <div class="flex overflow-x-auto gap-4 pb-4">
                        <!-- Card Style 1: Popular Motion Style -->
                        <div class="flex-none w-64">
                            <p class="text-xs text-gray-600 mb-2">Popular Motion Card</p>
                            <div class="backdrop-blur-sm bg-white/20 border border-white/30 rounded-2xl p-5 shadow-lg">
                                <div class="flex items-stretch space-x-4 h-full">
                                    <div class="flex-shrink-0 w-16 h-16 bg-white/40 rounded-xl flex items-center justify-center border border-white/50 overflow-hidden">
                                        <img :src="imagePreview" alt="Preview" class="w-full h-full object-cover rounded-xl" />
                                    </div>
                                    <div class="flex-1 min-w-0 flex flex-col justify-center">
                                        <h3 class="text-sm font-semibold text-gray-800">{{ newTitle || 'Your Title' }}</h3>
                                        <p class="text-xs text-gray-600 mt-1 line-clamp-2">{{ newDescription || 'Your description will appear here' }}</p>
                                        <div class="flex items-center mt-2 space-x-2">
                                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">New</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Card Style 2: Your Motions Style -->
                        <div class="flex-none w-56">
                            <p class="text-xs text-gray-600 mb-2">Your Motions Card</p>
                            <div class="relative shadow-xl flex-none w-56 h-40 rounded-lg overflow-hidden" :style="`background-image: url(${imagePreview}); background-size: cover; background-position: center;`">
                                <div class="absolute inset-0 bg-black/50"></div>
                                <div class="relative z-10 p-4 text-white flex flex-col justify-end h-full">
                                    <h2 class="text-base font-bold text-white">{{ newTitle || 'Your Title' }}</h2>
                                    <p class="text-white/80 text-sm">{{ newDescription || 'Your description' }}</p>
                                    <p class="text-white/60 text-xs">Just now</p>
                                </div>
                            </div>
                        </div>

                        <!-- Card Style 3: Saved Motions Style -->
                        <div class="flex-none w-56">
                            <p class="text-xs text-gray-600 mb-2">Saved Motions Card</p>
                            <div class="relative shadow-xl flex-none w-56 h-40 rounded-lg overflow-hidden" :style="`background-image: url(${imagePreview}); background-size: cover; background-position: center;`">
                                <div class="absolute inset-0 bg-black/50"></div>
                                <div class="absolute top-3 right-3">
                                    <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                    </svg>
                                </div>
                                <div class="relative z-10 p-4 text-white flex flex-col justify-end h-full">
                                    <h2 class="text-base font-bold text-white">{{ newTitle || 'Your Title' }}</h2>
                                    <p class="text-white/80 text-sm">{{ newDescription || 'Your description' }}</p>
                                    <p class="text-white/60 text-xs">Just now</p>
                                </div>
                            </div>
                        </div>

                        <!-- Card Style 4: Original Preview -->
                        <div class="flex-none w-64">
                            <p class="text-xs text-gray-600 mb-2">Original Image</p>
                            <img :src="imagePreview" alt="Preview" class="max-w-xs rounded-lg max-h-64" />
                        </div>
                    </div>
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
        const { data, error } = await supabase.from("motions").insert({
            title: newTitle.value,
            description: newDescription.value,
            public: newIsPublic.value,
            image: imageUrl || null,
            creator_id: userId
        }).select();

        
        
        
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
            navigateTo(`/app/sessions/record/${data[0].id}`);
        }
    } catch (err) {
        console.error("Error creating record:", err);
        alert("An error occurred while creating the record");
    } finally {
        isUploading.value = false;
    }
};
</script>
