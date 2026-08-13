import { StyleSheet } from "react-native";

export const colors = {
    background: "#FAFAFA",
    text: "#000000",
    textMuted: "#818182",
    input: "#FAFAFA",
    inputBorder: "#D7D7D9",
    inputTitle: "#6E6E6F",
    finalButtonText: "#635B8F",
    filledButtonColour: "#F5A623",
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

    subtitleno2: {
        fontSize: 14,
        color: colors.textMuted,
        textAlign: "left",
        fontFamily: "Inter_400Regular",
    },

    inputTitle: {
        width: "100%",
        fontSize: 14,
        fontFamily: "Inter_500Medium",
        marginBottom: 8,
    },

    inputField: {
        backgroundColor: colors.input,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.inputBorder,
        padding: 12,
        marginBottom: 8,
        fontSize: 14,
    },

    finalButton: {
        marginTop: 28,
        marginBottom: 12,
    },
    finalButtonImage: {
        width: "100%",
        height: 64, // use your actual Figma export dimensions
        justifyContent: "center",
        alignItems: "center",
    },

    buttonText: {
        fontSize: 16,
        color: colors.finalButtonText,
        marginTop: -8,
        fontFamily: "Inter_400Regular",
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

    passwordWrapper: {
        position: "relative",
        justifyContent: "center",
    },
    passwordInput: {
        paddingRight: 44,
    },
    eyeIcon: {
        position: "absolute",
        right: 12,
        height: "100%",
        justifyContent: "center",
    },

    box: {
        backgroundColor: colors.input,
        borderRadius: 12,
        borderWidth: 1,
        height: 172,
        padding: 20,
        borderColor: colors.inputBorder,
        elevation: 2,
    },
    codeBigText: {
        fontSize: 20,
        fontFamily: "Inter_400Regular",
        color: colors.inputTitle,
        fontWeight: "400",
        textAlign: "center",
        marginTop: 10,
        marginBottom: 0,
    },

    codeSmallText: {
        fontSize: 12,
        fontFamily: "Inter_400Regular",
        color: colors.finalButtonText,
        fontWeight: "400",
        textAlign: "left",
        marginTop: 20,
        marginLeft: 16,
    },
    orCircle: {
        width: 59,
        height: 59,
        borderRadius: 29.5,
        borderWidth: 1,
        borderColor: colors.inputBorder,
        backgroundColor: colors.background,
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        marginTop: -14,
        marginBottom: -14,
        zIndex: 10,
    },
    orText: {
        color: "#6B5B95",
        fontSize: 16,
        fontFamily: "Inter_500Medium",
        
    },


});



