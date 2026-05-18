import React, {useState} from 'react';
import { ScrollView, StyleSheet, View, Alert } from 'react-native';
import { ActivityIndicator, Text, Appbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useUser } from '@/src/hooks/useUser';
import { UserProfileForm } from '@/src/components/user/UserProfileForm';
import { UserProfileUpdateRequest } from '@/src/types/ui/user';

export default function EditProfileScreen() {
    const router = useRouter();
    const { user, userLoading, userError, updateUserProfile } = useUser();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleUpdate = async (data: UserProfileUpdateRequest) => {
        setIsSubmitting(true);
        try {
            await updateUserProfile(data);
            router.back();
        } catch (e: unknown) {
            Alert.alert(
                'Update Failed',
                e instanceof Error ? e.message : 'An unexpected error occurred. Please try again.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // Prevent rendering the form with null data to avoid crashes or empty fields
    if (userLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (userError || !user) {
        return (
            <View style={styles.centered}>
                <Text variant="bodyLarge">Error loading profile: {userError}</Text>
            </View>
        );
    }

    return (
        <View style={styles.screen}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Content title="Edit Profile" />
            </Appbar.Header>

            <ScrollView
                style={styles.container}
                keyboardShouldPersistTaps="handled"
            >
                <UserProfileForm
                    initialData={user}
                    onSubmit={handleUpdate}
                    isLoading={userLoading}
                    isSubmitting={isSubmitting}
                />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    container: { flex: 1},
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});