import { createClient } from '@supabase/supabase-js';

// Replace with your real Supabase project URL & Anon Key when ready
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const signInWithMagicLink = async (email) => {
  return await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin,
    },
  });
};

export const signOutUser = async () => {
  return await supabase.auth.signOut();
};
