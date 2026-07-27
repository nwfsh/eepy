import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

// context makes data available to every screen without passing that data around manually 
// when you keep passing a data screen to screen, it gets messy very quickly

// what the context type will contian 
type AuthContextType = {
    session: Session | null;
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
};

// holds actual session data and make it available to every screen 
// session -> full supabase session object
// user -> just the user info from that session
// loading -> whether if its checking if the session exist, will turn false as soon as checked 
const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    loading: true,
    signOut: async () => { },
});


// an auth provider wraps the whole app, it holds the actual session data and make it available 
// to every screen inside it 
// a parent to all the screens 
// kind of like doing 
{/* <AuthProvider>
    <HomeScreen />
    <LoginScreen />
</AuthProvider> */} 
// everything between authProvider is called children 


export function AuthProvider({ children }: { children: React.ReactNode }) {

    // setting them all empty 
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        // get the current session when app first loads 
        // but check if there is already a saved version in the device 
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null); // if session exist, get the user, or else return false 
            setLoading(false);
        });


        // setting up a permanent listener for auth changes (login, logout, token refresh)
        // it wld change automatically 
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
            }
        );

        // when AuthProvider is removed from the screen, it stops listening, listener will keep
        // listening in the bakcground and waste memory 
        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        // see youre storing them inside in between 
        <AuthContext.Provider value={{ session, user, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext); 