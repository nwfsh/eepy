import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { supabase } from "../lib/supabase";
import { onBoardingStyles } from "../styles/onboarding";
import { Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable } from "react-native";
import { ImageBackground } from "expo-image";

export default function SignUp({ navigation }: any) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignUp = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            Alert.alert("Error", error.message);
            setLoading(false);
            return;
        }
    };

    return (
        <View style={onBoardingStyles.container}>
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

            <Text style={onBoardingStyles.title}> Sign Up</Text>
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
            <TextInput
                style={onBoardingStyles.inputField}
                value={password}
                onChangeText={setPassword}
                // hide whats you type
                secureTextEntry
                placeholder="password"
            />

            <TouchableOpacity
                style={onBoardingStyles.finalButton}
                onPress={handleSignUp}
                disabled={loading}
            >
                <ImageBackground
                    source={require("../assets/tinified/onboardingButtonFinal.png")}
                    style={onBoardingStyles.finalButtonImage}
                    contentFit="fill"
                >
                    <Text style={onBoardingStyles.buttonText}>
                        {loading ? "Signing Up..." : "Sign Up"}
                    </Text>
                </ImageBackground>
            </TouchableOpacity>

            <Text style={onBoardingStyles.linkText}>
                Already have an account?{" "}
                <Text
                    style={onBoardingStyles.linkBold}
                    onPress={() => navigation.navigate("SignIn")}
                >
                    Sign In
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
    );
}
