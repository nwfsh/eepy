import { useState, useEffect } from "react";
import {
    Image,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
} from "react-native";
import { supabase } from "../lib/supabase";
import { onBoardingStyles } from "../styles/onboarding";
import { ImageBackground } from "expo-image";
import * as Clipboard from "expo-clipboard";

export default function RelationshipCodeScreen({ navigation }: any) {
    const [partnerCode, setPartnerCode] = useState("");
    const [myCode, setMyCode] = useState("");
    const [loading, setLoading] = useState(false);

   
    useEffect(() => {
        const loadCode = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session?.access_token}`,
            };
        
            let res = await fetch(
                    `${process.env.EXPO_PUBLIC_API_URL}/relationship`,
                    { method: "POST", headers }
                );

            if (res.ok) {
                const data = await res.json();
                setMyCode(data.relationship.code);
            } else {
                console.log("failed:", res.status); // ← also add a log so failures aren't silent
            }
        };
        loadCode();
    }, []); 

     const handleCopyCode = async () => {
        await Clipboard.setStringAsync(myCode);
        Alert.alert("Copied","Your code is copied to the clipboard");
     };
    

    const handleRelationshipCode = async () => {
        setLoading(true);

        // get the current session of the device
        // pulls specifically the session

        const {
            data: { session },
        } = await supabase.auth.getSession();

        if(partnerCode != "") {
            const response = await fetch(
                 `${process.env.EXPO_PUBLIC_API_URL}/relationship/add`,
            {
                // tell them what method ur using in the backend
                method: "PATCH",
                // to allow them to even be processed
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.access_token}`,
                },
                // the actual data ur sending
                body: JSON.stringify({relationshipCode: partnerCode}),
            }
            );

            if (!response.ok) {
            Alert.alert("Error", "Invalid or already-used code");
            setLoading(false);
            return;
        }
        }
    
        navigation.navigate("MorningHomeScreen");
        setLoading(false);
    };

    return (
        <View
            style={[
                onBoardingStyles.container, // { backgroundColor: "#f8efff" }
            ]}
        >
            <View style={{ position: "absolute", top: 0, left: 170 }}>
                <Image
                    source={require("../assets/tinified/myotherblotch.png")}
                />
            </View>
            <View style={{ position: "absolute", top: 0, right: 0 }}>
                <Image
                    source={require("../assets/tinified/whiteblobother.png")}
                />
            </View>

            <Text style={onBoardingStyles.title}>Relationship Code</Text>
            <Text style={onBoardingStyles.subtitle}>
                Pair with your partner..
            </Text>

            <View>
                <View style={onBoardingStyles.box}>
                    <Text style={onBoardingStyles.codeBigText}>
                        Invite Your Partner
                    </Text>
                    <View>
                        <Text style={onBoardingStyles.codeSmallText}>
                            Your Code : Click to Copy
                        </Text>
                        <View
                            style={{
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <TouchableOpacity
                                onPress={handleCopyCode}
                                style={{
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <Image
                                    source={require("../assets/tinified/yellowbox.png")}
                                />

                                <Text
                                    style={[
                                        onBoardingStyles.codeBigText,
                                        {
                                            position: "absolute",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            marginTop: -7,
                                        },
                                    ]}
                                >
                                    {myCode || "..."}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <View style={onBoardingStyles.orCircle}>
                    <Text style={onBoardingStyles.orText}>OR</Text>
                </View>

                <View style={onBoardingStyles.box}>
                    <Text style={onBoardingStyles.codeBigText}>
                        Enter partner Code
                    </Text>
                    <View>
                        <Text style={onBoardingStyles.codeSmallText}>
                            Partner’s Code :
                        </Text>
                        <View
                            style={{
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <Image
                                style={{ marginBottom: 10 }}
                                source={require("../assets/tinified/yellowbox.png")}
                            />
                            <TextInput
                                style={[
                                    onBoardingStyles.codeBigText,
                                    {
                                        position: "absolute",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginTop: -15,
                                        padding: 20,
                                        width: 200,
                                    },
                                ]}
                                value={partnerCode}
                                onChangeText={setPartnerCode}
                                maxLength={6}
                                autoCapitalize="characters"
                            ></TextInput>
                        </View>
                    </View>
                </View>
            </View>

            <TouchableOpacity
                style={[onBoardingStyles.finalButton]}
                onPress={handleRelationshipCode}
                disabled={loading}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
                <ImageBackground
                    source={require("../assets/tinified/onboardingButtonFinal.png")}
                    style={onBoardingStyles.finalButtonImage}
                    contentFit="fill"
                >
                    <Text style={onBoardingStyles.buttonText}>
                        {loading ? "Loading..." : "Complete"}
                    </Text>
                </ImageBackground>
            </TouchableOpacity>

            <View style={{ position: "absolute", bottom: 0, right: 130 }}>
                <Image source={require("../assets/tinified/myblotch.png")} />
            </View>

            <View style={{ position: "absolute", bottom: 0, left: 0 }}>
                <Image source={require("../assets/tinified/whiteblob.png")} />
            </View>
        </View>
    );
}
