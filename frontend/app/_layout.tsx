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
import {PaperProvider} from 'react-native-paper';
import {AuthProvider, useAuth} from '@/src/context/AuthContext';
import {theme} from '@/src/theme';

const queryClient = new QueryClient();

function RootNavigator() {
    const {user, isLoading} = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        console.log('Root layout mounted');
        return () => console.log('Root layout unmounted');
    }, []);

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
                <AuthProvider>
                    <RootNavigator />
                </AuthProvider>
            </PaperProvider>
        </QueryClientProvider>
    );
}