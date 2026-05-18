import React, {useState} from 'react';
import {View, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, Image} from 'react-native';
import {Text, TextInput, Button, HelperText} from 'react-native-paper';
import {useForm, Controller} from 'react-hook-form';
import {useRouter} from 'expo-router';
import {useAuth} from '@/src/context/AuthContext';
import {AuthLoginRequest} from '@/src/types/auth';
import {theme} from "@/src/theme";

export default function LoginScreen() {
    const router = useRouter();
    const {onLogin} = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {control, handleSubmit, formState: {errors}} = useForm<AuthLoginRequest>({
        defaultValues: {username: '', password: ''},
    });

    const handleLogin = async (data: AuthLoginRequest) => {
        setIsSubmitting(true);
        try {
            await onLogin(data);
            // Navigation is handled by the root navigator reacting to
            // AuthContext.user becoming non-null — no explicit push needed
        } catch (e: unknown) {
            console.log('Login error:', e);
            console.log('Login error message:', e instanceof Error ? e.message : 'unknown');
            Alert.alert('Login Failed', e instanceof Error ? e.message : 'An unexpected error occurred');

            Alert.alert('Login Failed', e instanceof Error ? e.message : 'An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.screen}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View style={styles.header}>
                    <Image
                        source={require('@/assets/images/icon.png')}
                        style={styles.icon}
                        resizeMode="contain"
                    />
                    <Text variant="headlineMedium" style={styles.title}>Welcome back</Text>
                </View>

                {/* Username */}
                <Controller
                    control={control}
                    name="username"
                    rules={{required: 'Username is required'}}
                    render={({field: {onChange, onBlur, value}}) => (
                        <View style={styles.field}>
                            <TextInput
                                label="Username"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                mode="outlined"
                                autoCapitalize="none"
                                autoCorrect={false}
                                disabled={isSubmitting}
                                error={!!errors.username}
                                returnKeyType="next"
                                left={<TextInput.Icon
                                    color={theme.colors.primary}
                                    icon="account"
                                />}
                            />
                            {errors.username && (
                                <HelperText type="error">{errors.username.message}</HelperText>
                            )}
                        </View>
                    )}
                />

                {/* Password */}
                <Controller
                    control={control}
                    name="password"
                    rules={{required: 'Password is required'}}
                    render={({field: {onChange, onBlur, value}}) => (
                        <View style={styles.field}>
                            <TextInput
                                label="Password"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                mode="outlined"
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                autoCorrect={false}
                                disabled={isSubmitting}
                                error={!!errors.password}
                                returnKeyType="done"
                                onSubmitEditing={handleSubmit(handleLogin)}
                                left={<TextInput.Icon
                                    color={theme.colors.primary}
                                    icon="lock"
                                />}
                                right={
                                    <TextInput.Icon
                                        color={theme.colors.primary}
                                        icon={showPassword ? 'eye-off' : 'eye'}
                                        onPress={() => setShowPassword(prev => !prev)}
                                    />
                                }
                            />
                            {errors.password && (
                                <HelperText type="error">{errors.password.message}</HelperText>
                            )}
                        </View>
                    )}
                />

                {/* Submit */}
                <Button
                    mode="contained"
                    onPress={handleSubmit(handleLogin)}
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    style={styles.submitButton}
                >
                    Log In
                </Button>

                {/* Sign up link */}
                <View style={styles.signupRow}>
                    <Text variant="bodyMedium">Don't have an account?</Text>
                    <Button
                        mode="text"
                        compact
                        onPress={() => router.push('/signup')}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.signupText}>Sign up</Text>
                    </Button>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    screen: {flex: 1},
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
        gap: 12,
    },
    header: {gap: 8, marginBottom: 16, alignItems: 'center', marginTop: 32},
    icon: {width: 120, height: 120, marginBottom: 16},
    title: {fontWeight: 'bold'},
    // subtitle: {opacity: 0.6},
    subtitle: {color: theme.colors.tertiaryDark},
    field: {gap: 4},
    submitButton: {marginTop: 8},
    signupRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    signupText: {color: theme.colors.tertiaryDark}
});