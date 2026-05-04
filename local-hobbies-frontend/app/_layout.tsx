import {useEffect} from 'react';
import {Stack, useRouter, useSegments} from 'expo-router';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {PaperProvider} from 'react-native-paper';
import {AuthProvider, useAuth} from '@/src/context/AuthContext';

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
    }, [user, isLoading, segments]);

    if (isLoading) return null;

    return <Stack screenOptions={{headerShown: false}} />;
}

export default function RootLayout() {
    return (
        <QueryClientProvider client={queryClient}>
            <PaperProvider>
                <AuthProvider>
                    <RootNavigator />
                </AuthProvider>
            </PaperProvider>
        </QueryClientProvider>
    );
}