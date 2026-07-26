import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// creating a remote controller for my supabase 
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
// why async storage? there is no local storage ( the way local browser has )
// its used to rmb ur your session so it doesnt erase when u completely locked out

// we have detectSessionInUrl false becus ur making an app, there is no link the way
// there is in a browser 

