// screens/app/(auth)/signup.tsx
import React, {useState} from 'react';
import {View, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView} from 'react-native';
import {Text, TextInput, Button, HelperText} from 'react-native-paper';
import {useForm, Controller} from 'react-hook-form';
import {useRouter} from 'expo-router';
import {useAuth} from '@/src/context/AuthContext';
import {AuthSignupRequest} from '@/src/types/auth';

export default function SignupScreen() {
    const router = useRouter();
    const {onSignup} = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {control, handleSubmit, formState: {errors}} = useForm<AuthSignupRequest>({
        defaultValues: {username: '', email: '', password: ''},
    });

    const handleSignup = async (data: AuthSignupRequest) => {
        setIsSubmitting(true);
        try {
            await onSignup(data);
            // Navigation handled by root navigator reacting to AuthContext.user
        } catch (e: unknown) {
            Alert.alert('Sign Up Failed', e instanceof Error ? e.message : 'An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text variant="headlineMedium" style={styles.title}>Create account</Text>
                    <Text variant="bodyMedium" style={styles.subtitle}>
                        Join to find people who share your hobbies.
                    </Text>
                </View>

                {/* Username */}
                <Controller
                    control={control}
                    name="username"
                    rules={{
                        required: 'Username is required',
                        minLength: {value: 3, message: 'Username must be at least 3 characters'},
                        pattern: {
                            value: /^[a-zA-Z0-9_]+$/,
                            message: 'Username can only contain letters, numbers, and underscores',
                        },
                    }}
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
                                left={<TextInput.Icon icon="account" />}
                            />
                            {errors.username && (
                                <HelperText type="error">{errors.username.message}</HelperText>
                            )}
                        </View>
                    )}
                />

                {/* Email */}
                <Controller
                    control={control}
                    name="email"
                    rules={{
                        required: 'Email is required',
                        pattern: {
                            value: /^\S+@\S+$/i,
                            message: 'Enter a valid email address',
                        },
                    }}
                    render={({field: {onChange, onBlur, value}}) => (
                        <View style={styles.field}>
                            <TextInput
                                label="Email"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                mode="outlined"
                                autoCapitalize="none"
                                autoCorrect={false}
                                keyboardType="email-address"
                                disabled={isSubmitting}
                                error={!!errors.email}
                                returnKeyType="next"
                                left={<TextInput.Icon icon="email" />}
                            />
                            {errors.email && (
                                <HelperText type="error">{errors.email.message}</HelperText>
                            )}
                        </View>
                    )}
                />

                {/* Password */}
                <Controller
                    control={control}
                    name="password"
                    rules={{
                        required: 'Password is required',
                        minLength: {value: 8, message: 'Password must be at least 8 characters'},
                    }}
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
                                onSubmitEditing={handleSubmit(handleSignup)}
                                left={<TextInput.Icon icon="lock" />}
                                right={
                                    <TextInput.Icon
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
                    onPress={handleSubmit(handleSignup)}
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    style={styles.submitButton}
                >
                    <Text>Create Account</Text>
                </Button>

                {/* Login link */}
                <View style={styles.loginRow}>
                    <Text variant="bodyMedium">Already have an account?</Text>
                    <Button
                        mode="text"
                        compact
                        onPress={() => router.push('/login')}
                        disabled={isSubmitting}
                    >
                        <Text>Log in</Text>
                    </Button>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    flex: {flex: 1},
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
        gap: 12,
    },
    header: {gap: 8, marginBottom: 8},
    title: {fontWeight: 'bold'},
    subtitle: {opacity: 0.6},
    field: {gap: 4},
    submitButton: {marginTop: 8},
    loginRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
});