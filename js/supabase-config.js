const SUPABASE_URL = 'https://oufiujxolduhfdsqkqwa.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_pnJHGyyHUfn0axGSqz078Q_nyojrvo8';

// Initialize Supabase client
window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
