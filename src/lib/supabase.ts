import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve credentials from environment
const envSupabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const envSupabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check localStorage for manually configured credentials in settings
const storedSupabaseUrl = typeof window !== 'undefined' ? localStorage.getItem('ccai_supabase_url') : null;
const storedSupabaseKey = typeof window !== 'undefined' ? localStorage.getItem('ccai_supabase_key') : null;

export const supabaseUrl = storedSupabaseUrl || envSupabaseUrl || '';
export const supabaseKey = storedSupabaseKey || envSupabaseKey || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl && 
    supabaseUrl.trim().length > 10 && 
    supabaseKey && 
    supabaseKey.trim().length > 10 &&
    !supabaseUrl.includes('your-project.supabase.co')
  );
};

let clientInstance: SupabaseClient | null = null;

if (isSupabaseConfigured()) {
  try {
    clientInstance = createClient(supabaseUrl, supabaseKey);
  } catch (error) {
    console.warn('Failed to initialize Supabase client:', error);
  }
}

export const supabase = clientInstance;

export const testSupabaseConnection = async (url: string, key: string): Promise<{ success: boolean; message: string }> => {
  if (!url || !key) {
    return { success: false, message: 'Both Supabase URL and Anon Key are required.' };
  }
  try {
    const testClient = createClient(url, key);
    const { error } = await testClient.from('profiles').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      return { success: false, message: `Connection error: ${error.message}` };
    }
    return { success: true, message: 'Successfully connected to Supabase database!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Failed to connect.' };
  }
};
