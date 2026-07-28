import { StyleSheet } from "react-native";



export const colors = {
    background: "#FAFAFA",
    text: "#000000",
    textMuted: "#818182",
    input: "#F4F5F7",
    inputBorder: "#D7D7D9",
    inputTitle: "#6E6E6F",
    finalButton: "#F0F0F2",
    finalButtonBorder: "#C3C5CA",
    filledButtonColour: "#F5A623"
};

export const onBoardingStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: 70,
        justifyContent: "center",
    },

    title: {
        fontSize: 36,
        fontFamily: "Inter_500Medium",
        color: colors.text,
        fontWeight: "500",
        textAlign: "center",
    },

    subtitle: {
        fontSize: 14,
        color: colors.textMuted,
        textAlign: "center",
        marginBottom: 36,
        fontFamily: "Inter_400Regular",
    },

    inputTitle: {
        fontSize: 14,
        fontFamily: "Inter_500Medium",
        marginBottom: 8,
    },

    inputField: {
        backgroundColor: colors.input,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colors.inputBorder,
        padding: 12,
        marginBottom: 8,
        fontSize: 14,
    },

    finalButton: {
        backgroundColor: colors.finalButton,
        borderRadius: 4,
        padding: 14,
        alignItems: "center",
        marginTop: 16,
        marginBottom: 12,

    },

    buttonText: {
        fontSize: 16,
        color: colors.finalButtonBorder,
        fontFamily: "Inter_600SemiBold",
    },

    linkText: {
        textAlign: "center",
        color: colors.textMuted,
        fontSize: 14,
        fontFamily: "Inter_500Medium",
    },

    linkBold: {
        color: colors.textMuted,
        fontFamily: "Inter_700Bold",
    },
});