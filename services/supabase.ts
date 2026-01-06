import { createClient } from '@supabase/supabase-js';

// IMPORTANT: You must replace 'https://your-project-id.supabase.co' with your actual Supabase Project URL.
// You can find this in your Supabase Dashboard -> Settings -> API.
export const supabaseUrl = 'https://lhzvkherdoazpgpwmwaw.supabase.co'; 

const supabaseKey = 'sb_publishable_TisGqEQh7cEpfr-1OXcCmw_V69e6rqg';

export const supabase = createClient(supabaseUrl, supabaseKey);