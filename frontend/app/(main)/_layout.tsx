import {Stack} from 'expo-router';
import {useAuth} from '@/src/context/AuthContext';
import {Redirect} from 'expo-router';

export default function MainLayout() {
    const {user, isLoading} = useAuth();

    if (isLoading) return null;
    if (!user) return <Redirect href="/(auth)/login" />;
    if (!user.onboardingComplete) return <Redirect href="/(auth)/onboarding" />;

    return <Stack screenOptions={{headerShown: false}} />;
}