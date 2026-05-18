import react from "eslint-plugin-react";
import reactNative from "eslint-plugin-react-native";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";

export default [
    {
        files: ["**/*.{js,jsx,ts,tsx}"],
        plugins: {
            react,
            "react-native": reactNative,
            "@typescript-eslint": typescriptEslint,
        },
        languageOptions: {
            parser: typescriptParser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        rules: {
            "react/jsx-no-useless-fragment": "warn",
            "react-native/no-raw-text": [
                "error",
                {
                    "skip": [
                        "Button",
                        "Text",
                        "HelperText",
                        "TextInput.Icon",
                        "Chip",
                        "Badge"
                    ]
                }
            ],
            "react/jsx-no-target-blank": "error",
            "@typescript-eslint/no-unused-vars": "warn",
        },
        settings: {
            react: {
                version: "detect",
            },
        },
    },
];