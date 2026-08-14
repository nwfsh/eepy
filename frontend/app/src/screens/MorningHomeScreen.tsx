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
import { homeScreenStyles } from "../styles/homescreen";
import { ImageBackground } from "expo-image";
import * as Clipboard from "expo-clipboard";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MorningHomeScreen({ navigation }: any) {
    const [myTimezone, setMyTimezone] = useState("")
    const [PartnerTimezone, setPartnerTimezone] = useState("")
    const [now, setNow] = useState(new Date())
    const [myName, setMyName] = useState("")
    const [partnerName, setPartnerName] = useState("")

    useEffect(() => {
        const loadTimezones = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session?.access_token}`,
            };
            const res = await fetch(
                `${process.env.EXPO_PUBLIC_API_URL}/relationship/information`,
                { headers }
            );


            if (res.ok) {
                const data = await res.json();
                 setPartnerTimezone(data.relationship.partner_timezone);
                 setPartnerName(data.relationship.partner_name);
            }

            // your own timezone from your user record
            const meRes = await fetch(
                `${process.env.EXPO_PUBLIC_API_URL}/user/me`,
                { headers }
            );
            if (meRes.ok) {
                const meData = await meRes.json();
                setMyTimezone(meData.user.timezone);
                setMyName(meData.user.preferred_name)

            }
  
        };
        loadTimezones();
    }, []);

    // tick every minute to keep clocks live
    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000 * 60);
        return () => clearInterval(interval); // cleanup when leaving screen
    }, []);

    // helper to format a time in a given timezone
    const formatTime = (timezone: string) => {
        if (!timezone) return "--:--";
        return new Intl.DateTimeFormat("en-US", {
            timeZone: timezone,
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        }).format(now);
    };


return (
    <SafeAreaView style={homeScreenStyles.container}>
        <View style={homeScreenStyles.sidebyside}>
            <View>
                <Text style={homeScreenStyles.timeTitle}>{myName} Time:</Text>
                <Text style={homeScreenStyles.time}>
                    {" "}
                    {formatTime(myTimezone)}
                </Text>
            </View>
            <View>
                <Text style={homeScreenStyles.timeTitle}>
                    {partnerName}'s Time:
                </Text>
                <Text style={homeScreenStyles.time}>
                    {" "}
                    {formatTime(PartnerTimezone)}{" "}
                </Text>
            </View>
        </View>

        <View style={homeScreenStyles.settingPlacement}>
            <Image source={require("../assets/tinified/settings.png")} />
        </View>

        <View style={{ alignItems: "center", justifyContent: "center" }}>
            {/* rays layered UNDER the sun, both centered on the same point */}
            <Image
                source={require("../assets/tinified/frametopray.png")}
                style={{ position: "absolute" }}
            />
            <Image
                source={require("../assets/tinified/framebottomray.png")}
                style={{ position: "absolute" }}
            />
            {/* sun on top, in normal flow so it defines the container size */}
            <Image source={require("../assets/tinified/framenakedcircle.png")} />
        </View>

        <Text style={homeScreenStyles.greeting}>Good Morning, {myName}!</Text>
        <Text style={homeScreenStyles.greetingsubtitle}>
            Your special message from{partnerName} is waiting for you..
        </Text>
        <View style={homeScreenStyles.notifPlacement}>
            <Image source={require("../assets/tinified/notif.png")} />
        </View>
    </SafeAreaView>
);
};