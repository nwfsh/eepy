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


return (
    <SafeAreaView style={homeScreenStyles.container}>
        <View style={homeScreenStyles.sidebyside}>
            <View>
                <Text style={homeScreenStyles.timeTitle}>Your Time:</Text>
                <Text style={homeScreenStyles.time}> 13:12pm</Text>
            </View>
            <View>
                <Text style={homeScreenStyles.timeTitle}>Aidan's Time:</Text>
                <Text style={homeScreenStyles.time}> 4:12pm </Text>
            </View>
        </View>

        <View style={homeScreenStyles.settingPlacement}>
            <Image source={require("../assets/tinified/settings.png")} />
        </View>

        <View style={{right:2}}>
            <Image source={require("../assets/tinified/sun.png")} />
        </View>

        <Text style={homeScreenStyles.greeting}>Good Morning, Avery!</Text>
        <Text style={homeScreenStyles.greetingsubtitle}>
            Your special message from Aidan is waiting for you..
        </Text>
        <View style= {homeScreenStyles.notifPlacement}>
            <Image source={require("../assets/tinified/notif.png")} />
        </View>
    </SafeAreaView>
);
};