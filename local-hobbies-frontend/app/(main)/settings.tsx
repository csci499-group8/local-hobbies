import React from 'react';
import { ScrollView, StyleSheet, View, Alert } from 'react-native';
import { ActivityIndicator, Text, Appbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useUser } from '@/src/hooks/useUser';
import { UserSettingsForm } from '@/src/components/user/UserSettingsForm';
import { UserSettingsUpdateRequest } from '@/src/types/ui/user';

export default function EditSettingsScreen() {
    const router = useRouter();
    const { user, userLoading, userError, updateUserSettings } = useUser();

    const handleUpdate = async (data: UserSettingsUpdateRequest) => {
        try {
            await updateUserSettings(data);
            // Optional: Show success snackbar or toast here
            router.back();
        } catch (e: unknown) {
            Alert.alert(
                'Update Failed',
                e instanceof Error ? e.message : 'An unexpected error occurred while saving settings.'
            );
        }
    };

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
                <Text variant="bodyLarge">Error loading settings: {userError}</Text>
            </View>
        );
    }

    return (
        <View style={styles.screen}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Content title="Settings" />
            </Appbar.Header>

            <ScrollView
                style={styles.container}
                keyboardShouldPersistTaps="handled"
            >
                <UserSettingsForm
                    initialData={user}
                    onSubmit={handleUpdate}
                    isLoading={userLoading}
                />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    container: { flex: 1, backgroundColor: '#fff' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});