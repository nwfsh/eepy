import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { supabase } from "../lib/supabase";
import { onBoardingStyles } from "../styles/onboarding";
import { Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ImageBackground } from "expo-image";
import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SignInScreen({ navigation }: any) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSignIn = async () => {
        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            Alert.alert("Error", error.message);
        }
        setLoading(false);
    };

    return (
        <View
            // colors={["#FFF8E7", "#E6E2FF"]}
            style={onBoardingStyles.container}
        >
            <View style={{ position: "absolute", top: 0, left: 170 }}>
                <Image
                    source={require("../assets/tinified/myotherblotch.png")}
                />
            </View>

            <View style={{ position: "absolute", top: 190, left: 0 }}>
                <Image
                    source={require("../assets/tinified/onboardingsun.png")}
                    style={{ width: 200, height: 150 }}
                />
            </View>
            <Text style={onBoardingStyles.title}> Sign In</Text>
            <Text style={onBoardingStyles.subtitle}>
                {" "}
                Stay Connected With Eepy{" "}
            </Text>

            <Text style={onBoardingStyles.inputTitle}> Email </Text>
            <TextInput
                style={onBoardingStyles.inputField}
                value={email}
                onChangeText={setEmail}
                // tells your keyboard to add @ into the keyboard makes it easier
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="your@gmail.com"
            />

            <Text style={onBoardingStyles.inputTitle}> Password </Text>
            <View style={onBoardingStyles.passwordWrapper}>
                <TextInput
                    style={[
                        onBoardingStyles.inputField,
                        onBoardingStyles.passwordInput,
                    ]}
                    value={password}
                    onChangeText={setPassword}
                    // hide whats you type
                    secureTextEntry={!showPassword}
                    placeholder="password"
                />

                <Pressable
                    onPress={() => setShowPassword((prev) => !prev)}
                    style={onBoardingStyles.eyeIcon}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <Ionicons
                        name={showPassword ? "eye-off" : "eye"}
                        size={20}
                        color="#D7D7D9"
                    />
                </Pressable>
            </View>

            <TouchableOpacity
                style={onBoardingStyles.finalButton}
                onPress={handleSignIn}
                disabled={loading}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
                <ImageBackground
                    source={require("../assets/tinified/onboardingButtonFinal.png")}
                    style={onBoardingStyles.finalButtonImage}
                    contentFit="fill"
                >
                    <Text style={onBoardingStyles.buttonText}>
                        {loading ? "Signing In..." : "Sign In"}
                    </Text>
                </ImageBackground>
            </TouchableOpacity>

            <Text style={onBoardingStyles.linkText}>
                No account?{" "}
                <Text
                    style={onBoardingStyles.linkBold}
                    onPress={() => navigation.navigate("SignUp")}
                >
                    Sign Up
                </Text>
            </Text>

            <View style={{ position: "absolute", top: 670, right: 0 }}>
                <Image
                    source={require("../assets/tinified/onboardingmoon.png")}
                    style={{ width: 200, height: 80 }}
                />
            </View>

            <View style={{ position: "absolute", bottom: 0, right: 130 }}>
                <Image source={require("../assets/tinified/myblotch.png")} />
            </View>
        </View>

        // you can style no account and sign up in different colour if you nest them like that
        // write {" "} to put space between both texts
    );
}
