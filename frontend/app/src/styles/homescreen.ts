import { StyleSheet } from "react-native"


export const colors = {
    background: "#FAFAFA",
    text: "#000000",
    textMuted: "#7E7E7E",
    timeText: "#565656",
    sunText: "#FFDB75",
};

export const homeScreenStyles = {
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: 20,
        justifyContent: "center",
    },

    greeting: {
        color: colors.text,
        fontFamily: "Inter_500Medium",
        fontSize: 24,
        textAlign: "center",
    },

    greetingsubtitle: {
        color: colors.textMuted,
        fontFamily: "Inter_500Medium",
        fontSize: 16,
        fontAlign: "center",
    },

    timeTitle: {
        colors: colors.timeText,
        fontFamily: "Inter_500Medium",
        fontSize: 14,
        fontAlign: "left",
    },

    time: {
        colors: colors.text,
        fontFamily: "Inter_500Medium",
        fontSize: 36,
        fontAlign: "left",
    },
};