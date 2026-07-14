import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

// grabbing them from the env file 
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

// making those those exists, gives u a proper error message 
if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env");
}

// takes your supabase URL and service key and gives you back a client object
// a client object is just a controller 
export const supabase = createClient(supabaseUrl, supabaseServiceKey);