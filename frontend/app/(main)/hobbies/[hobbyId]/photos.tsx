import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text, Appbar } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useHobbyPhotosByHobby, useHobby } from '@/src/hooks/useHobby';
import { BaseHobbyPhotoScreen } from '@/src/components/hobby/BaseHobbyPhotoScreen';
import {commonStyles} from '@/src/theme';

export default function HobbySpecificPhotosScreen() {
    const router = useRouter();
    const { hobbyId } = useLocalSearchParams<{ hobbyId: string }>();

    const { hobbyPhotos, hobbyPhotosLoading, hobbyPhotosError } = useHobbyPhotosByHobby(hobbyId!);
    // Fetch hobbies to find the name for the Appbar title
    const { hobbies } = useHobby();

    if (hobbyPhotosLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    const currentHobby = hobbies.find(h => h.id === hobbyId);

    return (
        <View style={styles.screen}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Content title={currentHobby?.name ? currentHobby.name + ' Gallery': 'Gallery'} />
            </Appbar.Header>

            {hobbyPhotos.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text variant="bodyLarge">You haven't added any photos yet.</Text>
                    <Text variant="bodyMedium" style={styles.emptySubtext}>
                        Tap + to add one.
                    </Text>
                </View>
            ) : (
                <BaseHobbyPhotoScreen
                    grid="flat"
                    hobbyId={hobbyId!}
                    photos={hobbyPhotos}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: {flex: 1, paddingTop: 80, justifyContent: 'center', alignItems: 'center'},
    emptySubtext: commonStyles.mutedText,
});