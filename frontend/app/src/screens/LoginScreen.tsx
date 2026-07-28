import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,} from "react-native";
import { supabase} from "../lib/supabase"
import { onBoardingStyles } from "../styles/onboarding";
import OnboardingSun from "../assets/onboardingsun.svg";
import OnboardingMoon from "../assets/onboardingmoon.svg"
import { Image } from "react-native";


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
        < View style = {onBoardingStyles.container}>
        <View style={{ position: 'absolute', top: 190, left: 0 }}>
        <Image source={require("../assets/onboardingsun.png")} style={{ width: 200, height: 150 }} />
        </View>
        <Text style = { onBoardingStyles.title }> Sign In</Text>
        <Text style = { onBoardingStyles.subtitle}> Stay Connected With Eepy </Text>

        <Text style = {onBoardingStyles.inputTitle}> Email </Text>
        <TextInput style = { onBoardingStyles.inputField}
        value = {email} 
        onChangeText={setEmail}
        // tells your keyboard to add @ into the keyboard makes it easier 
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="your@gmail.com"
        />

        <Text style = {onBoardingStyles.inputTitle} > Password </Text>
        <TextInput style = { onBoardingStyles.inputField}
        value = {password}
        onChangeText = {setPassword}
        // hide whats you type
        secureTextEntry 
        placeholder = "password"
        />

        <TouchableOpacity style = {onBoardingStyles.finalButton} onPress={handleSignIn} disabled={loading}>
            <Text style = { onBoardingStyles.buttonText}> {loading ? "Signing In..." : "Sign in" }</Text>
        </TouchableOpacity>

        
        <Text style = {onBoardingStyles.linkText }> 
            No account?{" "}
            <Text style = {onBoardingStyles.linkBold}>Sign Up</Text>
        </Text>

        <View style={{ position: 'absolute', top: 655, right: 0}}>
        <Image source={require("../assets/onboardingmoon.png")} style={{ width: 200, height: 80}} />
        </View>
        
        </View>

        // you can style no account and sign up in different colour if you nest them like that
        // write {" "} to put space between both texts 

    );







}