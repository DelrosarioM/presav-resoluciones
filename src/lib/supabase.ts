import { createClient } from '@supabase/supabase-js';

// Usamos el "!" al final para decirle a TypeScript que estamos seguros de que estas variables existen
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Exportamos el cliente para poder usarlo en cualquier parte de nuestra app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);