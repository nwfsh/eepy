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
import * as Localization from "expo-localization";
import { ImageBackground } from "expo-image";

export default function CreateProfileScreen({ navigation }: any) {
    const [preferredName, setPreferredName] = useState("");
    const [pronouns, setPronouns] = useState("");
    const [timezone, setTimezone] = useState("");
    const [loading, setLoading] = useState(false);
    const [tzOpen, setTzOpen] = useState(false);

    const allZones = [
        "America/Vancouver",
        "America/Los_Angeles",
        "America/Denver",
        "America/Chicago",
        "America/New_York",
        "America/Toronto",
        "America/Mexico_City",
        "America/Sao_Paulo",
        "America/Halifax",
        "America/Anchorage",
        "Pacific/Honolulu",
        "Europe/London",
        "Europe/Dublin",
        "Europe/Paris",
        "Europe/Berlin",
        "Europe/Madrid",
        "Europe/Rome",
        "Europe/Amsterdam",
        "Europe/Stockholm",
        "Europe/Athens",
        "Europe/Moscow",
        "Europe/Istanbul",
        "Africa/Cairo",
        "Africa/Lagos",
        "Africa/Johannesburg",
        "Africa/Nairobi",
        "Asia/Dubai",
        "Asia/Karachi",
        "Asia/Kolkata",
        "Asia/Dhaka",
        "Asia/Bangkok",
        "Asia/Jakarta",
        "Asia/Singapore",
        "Asia/Hong_Kong",
        "Asia/Shanghai",
        "Asia/Manila",
        "Asia/Taipei",
        "Asia/Tokyo",
        "Asia/Seoul",
        "Asia/Kuala_Lumpur",
        "Australia/Perth",
        "Australia/Adelaide",
        "Australia/Sydney",
        "Australia/Brisbane",
        "Pacific/Auckland",
        "Pacific/Fiji",
        "Pacific/Guam",
    ];
const filteredZones = allZones.filter((z) =>
    z.toLowerCase().includes(timezone.toLowerCase())
);

    useEffect(() => {
        const detected = Localization.getCalendars()[0].timeZone;

        if(detected) setTimezone(detected);

    }, []);

    const handleCompleteProfile = async () => {
        setLoading(true);

        if (!preferredName || !pronouns || !timezone) {
            Alert.alert("Error", "Please fill in all fields");
            setLoading(false);
            return;
        }
        // get the current session of the device
        // pulls specifically the session

        const {
            data: { session },
        } = await supabase.auth.getSession();

        // we need to fetch via ${process.env.EXPO_PUBLIC_API_URL}
        // as back then, frontend and backend was  was on the same server for cpsc 310 project
        // but now frontend and backend are now on diff server, frontend = phone, backend = laptop
        // so u cant use relative URL to connect them
        // this is the full url

        const response = await fetch(
            `${process.env.EXPO_PUBLIC_API_URL}/user/me`,
            {
                // tell them what method ur using in the backend
                method: "PATCH",
                // to allow them to even be processed
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.access_token}`,
                },
                // the actual data ur sending
                body: JSON.stringify({
                    preferred_name: preferredName,
                    pronouns,
                    timezone,
                }),
            }
        );

        if (!response.ok) {
            Alert.alert("Error", "Failed to save full profile");
            setLoading(false);
            return;
        }

        navigation.navigate("SleepSchedule");
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

            <Text style={onBoardingStyles.title}> Create Profile</Text>
            <Text style={onBoardingStyles.subtitle}>
                {" "}
                Tell us more about you!
            </Text>

            <Text style={onBoardingStyles.inputTitle}> Preferred Name </Text>
            <TextInput
                style={onBoardingStyles.inputField}
                value={preferredName}
                onChangeText={setPreferredName}
                // tells your keyboard to add @ into the keyboard makes it easier
                autoCapitalize="none"
                placeholder="avery"
            />

            <Text style={onBoardingStyles.inputTitle}> Pronouns </Text>
            <TextInput
                style={onBoardingStyles.inputField}
                value={pronouns}
                onChangeText={setPronouns}
                autoCapitalize="none"
                placeholder="she/her"
            />

            <TouchableOpacity
                style={onBoardingStyles.finalButton}
                onPress={handleCompleteProfile}
                disabled={loading}
            >
                <ImageBackground
                    source={require("../assets/tinified/onboardingButtonFinal.png")}
                    style={onBoardingStyles.finalButtonImage}
                    contentFit="fill"
                >
                    <Text style={onBoardingStyles.buttonText}>
                        {loading ? "Loading" : "Next ->"}
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
