import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,} from "react-native";
import { supabase} from "../lib/supabase"

export default function LoginScreen () {
    const [ email, setEmail ] = useState("");
    const [ password, setPassword ] = useState("");
    const [ loading, setLoading ] = useState(false);

    const handleSignIn = async () => {
        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
 
        if (error) {
            Alert.alert("Error", error.message)
        }
        setLoading(false);
    };

    return (
        < View>
        <Text> Sign in</Text>
        <Text> Stay Connected With Eepy </Text>

        <Text> Email </Text>
        <TextInput 
        value = {email} 
        onChangeText={setEmail}
        // tells your keyboard to add @ into the keyboard makes it easier 
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="your@gmail.com"
        />

        <Text> Password </Text>
        <TextInput
        value = {password}
        onChangeText = {setPassword}
        // hide whats you type
        secureTextEntry 
        placeholder = "password"
        />

        <TouchableOpacity onPress={handleSignIn} disabled={loading}>
            <Text> {loading ? "Signing In..." : "Sign in" }</Text>
        </TouchableOpacity>

        
        <Text> 
            No account?{" "}
            <Text>Sign Up</Text>
        </Text>
        
        </View>

        // you can style no account and sign up in different colour if you nest them like that
        // write {" "} to put space between both texts 

    );







}