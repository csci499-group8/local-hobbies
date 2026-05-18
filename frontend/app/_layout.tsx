// Polyfill: makes React Native's native Blob recognised by axios so that
// presigned-URL uploads send real binary data instead of an empty object.
// Must run before any upload code is executed.
if (typeof Blob !== 'undefined') {
    // @ts-expect-error — RN Blob lacks Symbol.toStringTag
    Blob.prototype[Symbol.toStringTag] = 'Blob';
}

import {useEffect} from 'react';
import {Stack, useRouter, useSegments} from 'expo-router';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {PaperProvider, adaptNavigationTheme} from 'react-native-paper';
import {ThemeProvider, DefaultTheme, Theme} from '@react-navigation/native';
import {AuthProvider, useAuth} from '@/src/context/AuthContext';
import {theme} from '@/src/theme';
import {LogBox} from 'react-native';

// AvailabilityCalendar renders a FlatList (virtualized, supports up to 180 day groups)
// inside a ScrollView. nestedScrollEnabled handles the scroll correctly on Android,
// but React Native still emits this dev-only warning. The warning is suppressed here
// since the pattern is intentional.
LogBox.ignoreLogs(['VirtualizedLists should never be nested']);

const {LightTheme} = adaptNavigationTheme({
    reactNavigationLight: DefaultTheme,
    materialLight: theme,
}) as {LightTheme: Theme};

const queryClient = new QueryClient();

function RootNavigator() {
    const {user, isLoading} = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = segments[0] === '(auth)';

        if (!user && !inAuthGroup) {
            router.replace('/(auth)/login');
        } else if (user && !user.onboardingComplete && segments[1] !== 'onboarding') {
            router.replace('/(auth)/onboarding');
        } else if (user && user.onboardingComplete && inAuthGroup) {
            router.replace('/(main)/(tabs)');
        }
    }, [user, isLoading, segments.join(',')]); //stringify to avoid comparing by array reference

    if (isLoading) return null;

    return <Stack screenOptions={{headerShown: false}} />;
}

export default function RootLayout() {
    return (
        <QueryClientProvider client={queryClient}>
            <PaperProvider theme={theme}>
                <ThemeProvider value={LightTheme}>
                    <AuthProvider>
                        <RootNavigator />
                    </AuthProvider>
                </ThemeProvider>
            </PaperProvider>
        </QueryClientProvider>
    );
}