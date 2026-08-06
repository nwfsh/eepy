import { useState  } from "react";
import { Image, View, Text,  TextInput, TouchableOpacity, Alert } from "react-native";
import { supabase } from "../lib/supabase";
import { onBoardingStyles } from "../styles/onboarding";
import { LinearGradient } from "expo-linear-gradient";
import * as Localization from "expo-localization";

export default function ({navigation} : any) {
    const [preferredName, setPreferredName] = useState("");
    const [pronouns, setPronouns] = useState("");
    const [timezone, setTimezone] = useState("");
    const [loading, setLoading] = useState(false);

    const handleCompleteProfile = async () => {
        setLoading(true);

        if (!preferredName || !pronouns || !timezone) {
            Alert.alert("Error", "Please fill in all fields")
            setLoading(false);
            return;
        }
        // get the current session of the device 
        // pulls specifically the session 

        const { data: { session }} = await supabase.auth.getSession();


        // we need to fetch via ${process.env.EXPO_PUBLIC_API_URL}
        // as back then, frontend and backend was  was on the same server for cpsc 310 project
        // but now frontend and backend are now on diff server, frontend = phone, backend = laptop
        // so u cant use relative URL to connect them 
        // this is the full url 

        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/user/me`, {
            // tell them what method ur using in the backend 
            method: "PATCH",
            // to allow them to even be processed
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session?.access_token}`
            },
            // the actual data ur sending 
            body: JSON.stringify({preferred_name: preferredName, pronouns, timezone})
        });

        if (!response.ok) {
            Alert.alert("Error", "Failed to save full profile")
            setLoading(false);
            return;
        }

        navigation.navigate("RelationshipCode");
        setLoading(false);
    };

    return ( 
        <LinearGradient 
        colors={["#FFF8E7", "#E6E2FF"]}
        style={onBoardingStyles.container}>

        

        <Text style = {onBoardingStyles.inputTitle}> Preferred Name </Text>
        <TextInput style = { onBoardingStyles.inputField}
        value = {preferredName} 
        onChangeText={setPreferredName}
        // tells your keyboard to add @ into the keyboard makes it easier 
        autoCapitalize="none"
        placeholder="avery"
        />

        <Text style = {onBoardingStyles.inputTitle}> Timezone </Text>
           <TextInput style = { onBoardingStyles.inputField}
            value = {timezone} 
            onChangeText={setTimezone}
            autoCapitalize="none"
            placeholder="PST"
        />

        <Text style = {onBoardingStyles.inputTitle}> Pronouns </Text>
           <TextInput style = { onBoardingStyles.inputField}
            value = {pronouns} 
            onChangeText={setPronouns}
            autoCapitalize="none"
        />

        </LinearGradient>

    )

}