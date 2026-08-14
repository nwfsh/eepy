import { StyleSheet } from "react-native"
import { Dimensions } from "react-native";
const { width } = Dimensions.get("window");
const scale = (size: number) => (width / 375) * size;  // 375 = baseline iPhone width


export const colors = {
    background: "#FAFAFA",
    text: "#000000",
    textMuted: "#7E7E7E",
    timeText: "#565656",
    sunText: "#FFDB75",
};

export const homeScreenStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: 10,
        justifyContent: "flex-start",
        alignItems: "center",
    },

    greeting: {
        color: colors.text,
        fontFamily: "Inter_500Medium",
        fontSize: 24,
        textAlign: "center",
        paddingTop: 24,
    },

    greetingsubtitle: {
        color: colors.textMuted,
        fontFamily: "Inter_500Medium",
        fontSize: 16,
        textAlign: "center",
        paddingHorizontal: "15%",
        paddingTop: 8,
    },

    timeTitle: {
        color: colors.timeText,
        fontFamily: "Inter_500Medium",
        fontSize: 14,
        textAlign: "left",
        marginTop: 30,
    },

    time: {
        color: colors.text,
        fontFamily: "Inter_500Medium",
        fontSize: 40,
        textAlign: "left",
        marginBottom: 70,
        marginLeft: -12,
    },
    sidebyside: {
        flexDirection: "row",
        justifyContent: "flex-start",
        gap: scale(32),
    },
    settingPlacement: {
        left: "20%",
        marginBottom: -70,
    },

    notifPlacement: {
        left: "30%",
        marginTop: 40,
    },
});