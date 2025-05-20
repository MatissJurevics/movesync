import { supabase } from "@/utils/supabase";

export default defineEventHandler(async (event) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
  });
});