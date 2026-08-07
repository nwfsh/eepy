import { StyleSheet } from "react-native";



export const colors = {
    background: "#FAFAFA",
    text: "#000000",
    textMuted: "#818182",
    input: "#FAFAFA",
    inputBorder: "#D7D7D9",
    inputTitle: "#6E6E6F",
    finalButtonText : "#635B8F",
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
        marginBottom: 32,
        fontFamily: "Inter_400Regular",
    },

    inputTitle: {
        width: '100%',
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
    width: '100%',
    height: 64,          // use your actual Figma export dimensions
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
    position: 'relative',
    justifyContent: 'center',
},
passwordInput: {
    paddingRight: 44,
},
eyeIcon: {
    position: 'absolute',
    right: 12,
    height: '100%',
    justifyContent: 'center',
},

    
});