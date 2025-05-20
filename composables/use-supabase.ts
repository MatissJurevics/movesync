import { createClient } from "@supabase/supabase-js";


const supabaseUrl = "https://ezhytagecfwzhdgvijwk.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6aHl0YWdlY2Z3emhkZ3ZpandrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4MTExNTcsImV4cCI6MjA2MTM4NzE1N30.wm96_uTg-mzgvIuG-hUvAAjGA-rciC6PXWIvY165eWk";


if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables\n" + supabaseUrl + "\n" + supabaseKey);
  }

export default () => {
    return createClient(supabaseUrl, supabaseKey)
}

