import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text, Appbar } from 'react-native-paper';
import { useHobby } from '@/src/hooks/useHobby';
import { BaseHobbyPhotoScreen } from '@/src/components/hobby/BaseHobbyPhotoScreen';
import {router} from "expo-router";
import {commonStyles} from '@/src/theme';

export default function AllHobbyPhotosScreen() {
    const {hobbies, hobbyPhotos, hobbyPhotosLoading, hobbyPhotosError} = useHobby();

    if (hobbyPhotosLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large"/>
            </View>
        );
    }

    if (hobbyPhotosError || !hobbyPhotos) {
        return (
            <View style={styles.centered}>
                <Text variant="bodyLarge">
                    Error loading gallery: {hobbyPhotosError}
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.screen}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => router.back()}/>
                <Appbar.Content title="All Hobbies Gallery"/>
            </Appbar.Header>

            {hobbyPhotos.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text variant="bodyLarge">You haven't added any photos yet.</Text>
                    <Text variant="bodyMedium" style={styles.emptySubtext}>
                        Tap Tap + to add one.
                    </Text>
                </View>
            ) : (
                <BaseHobbyPhotoScreen
                    grid="grouped"
                    hobbies={hobbies}
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