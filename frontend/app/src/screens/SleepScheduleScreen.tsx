import { useState } from "react";
import {
    Image,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    Platform,
} from "react-native";
import { supabase } from "../lib/supabase";
import { onBoardingStyles } from "../styles/onboarding";
import { ImageBackground } from "expo-image";
import { currentTimeToMins, TimeOfDay } from "../logic/time";
import DateTimePicker from "@react-native-community/datetimepicker"

export default function SleepScheduleScreen({ navigation }: any) {
    const [wakeTime, setWakeTime] = useState(new Date);
    const [sleepTime, setSleepTime] = useState(new Date);

    const [showWakePicker, setShowWakePicker] = useState(false);
    const [showSleepPicker, setShowSleepPicker] = useState(false);
    const [window, setWindow] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSleepSchedule = async () => {
        setLoading(true);

        if (!wakeTime || !sleepTime || !window) {
            Alert.alert("Error", "Please fill in all fields");
            setLoading(false);
            return;
        }

        if (Number(window) > 180) {
            Alert.alert("Error", "Please keep window within 1.5 hours");
            setLoading(false);
            return;
        }
        // get the current session of the device
        // pulls specifically the session

        const wake_time = currentTimeToMins(wakeTime);
        const sleep_time = currentTimeToMins(sleepTime);
        const win = Number(window);

        if (wake_time == sleep_time) {
            Alert.alert(
                "Error",
                "wakeTime and sleepTime shouldn't be the same"
            );
            setLoading(false);
            return;
        }

        // raw difference
        const rawDiff = Math.abs(wake_time - sleep_time);
        // the clock is circular (1440 min), so the real gap is the shorter of
        // going forward or wrapping around
        const circularGap = Math.min(rawDiff, 1440 - rawDiff);

        // the two grace windows collide if the gap between the centers
        // is less than the combined width of both half-windows
        if (circularGap <= win * 2) {
            Alert.alert(
                "Error",
                "Your wake and sleep windows are too close together, they will overlap. Space them further apart or shorten your window."
            );
            setLoading(false);
            return;
        }

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
                    wake_time,
                    sleep_time,
                    thewindow: Number(window),
                }),
            }
        );

        if (!response.ok) {
            Alert.alert("Error", "Failed to save sleep schedule");
            setLoading(false);
            return;
        }

        navigation.navigate("relationshipCode");
        setLoading(false);
    };;

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

            <Text style={onBoardingStyles.title}> Sleep Schedule</Text>
            <Text style={onBoardingStyles.subtitle}>
                {" "}
                Tell us the goals youre aiming for!
            </Text>

            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    gap: 60,
                    marginBottom: 24,
                }}
            >
                <View style={{ alignItems: "flex-start" }}>
                    <Text style={onBoardingStyles.inputTitle}>Wake Time</Text>
                    <DateTimePicker
                        style={{ marginLeft: -4, transform: [{ scale: 1.2 }] }}
                        value={wakeTime}
                        mode="time"
                        is24Hour={false}
                        display={Platform.OS === "ios" ? "compact" : "default"}
                        onChange={(event, selectedDate) => {
                            if (selectedDate) setWakeTime(selectedDate);
                        }}
                    />
                </View>

                <View style={{ alignItems: "flex-start" }}>
                    <Text style={onBoardingStyles.inputTitle}>Sleep Time</Text>
                    <DateTimePicker
                        style={{ marginLeft: -4, transform: [{ scale: 1.2 }] }}
                        value={sleepTime}
                        mode="time"
                        is24Hour={false}
                        display={Platform.OS === "ios" ? "compact" : "default"}
                        onChange={(event, selectedDate) => {
                            if (selectedDate) setSleepTime(selectedDate);
                        }}
                    />
                </View>
            </View>

            <Text style={onBoardingStyles.inputTitle}>
                {" "}
                Window (in minutes)
            </Text>
            <TextInput
                style={onBoardingStyles.inputField}
                value={window}
                onChangeText={setWindow}
                autoCapitalize="none"
                placeholder="she/her"
            />
            <Text style={onBoardingStyles.subtitleno2}>
                A 20-minute window means you can check in 20 minutes before or
                after your set time and still be on time.
            </Text>

            <TouchableOpacity
                style={onBoardingStyles.finalButton}
                onPress={handleSleepSchedule}
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
