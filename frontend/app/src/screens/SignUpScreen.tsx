import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert,} from "react-native";
import { supabase} from "../lib/supabase"
import { onBoardingStyles } from "../styles/onboarding";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";

export default function SignUp({navigation}: any) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignUp =  async () => {
        setLoading(true);
        if (password !==  confirmPassword) {
            Alert.alert("Error","Password does not match");
            setLoading(false);
            return;
        }
        const { error } = await supabase.auth.signUp({
            email, password});

        if (error) {
            Alert.alert("Error",error.message);
            setLoading(false);
            return;
        }

        navigation.navigate("CompleteProfile")
    };

    return (
        <View style = {onBoardingStyles.container}> 
        <View style={{ position: 'absolute', top: 160, left: 0 }}>
        <Image source={require("../assets/onboardingsun.png")} style={{ width: 200, height: 150 }} />
        </View>
        <Text style = { onBoardingStyles.title }> Sign Up</Text>
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

        <Text style = {onBoardingStyles.inputTitle} > Confirm Password </Text>
        <TextInput style = { onBoardingStyles.inputField}
        value = {confirmPassword}
        onChangeText = {setConfirmPassword}
        // hide whats you type
        secureTextEntry 
        placeholder = "confirm password"
        />

        
        <TouchableOpacity style = {onBoardingStyles.finalButton} onPress={handleSignUp} disabled={loading}>
            <Text style = { onBoardingStyles.buttonText}>
            
                 {loading ? "Signing Up..." : "Sign Up" }</Text>
        </TouchableOpacity>
        

        <Text style = {onBoardingStyles.linkText }> 
        Already have an account?{" "}
            <Text style = {onBoardingStyles.linkBold}
            onPress={ () => navigation.navigate("LogIn")}
            >Sign In</Text>
        </Text>

        <View style={{ position: 'absolute', top: 700, right: 0}}>
        <Image source={require("../assets/onboardingmoon.png")} style={{ width: 200, height: 80}} />
        </View>

        </View>

    )
}