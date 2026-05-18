import React from 'react';
import {View, StyleSheet} from 'react-native';
import {ActivityIndicator, Text, Appbar, ProgressBar} from 'react-native-paper';
import {useHobby} from '@/src/hooks/useHobby';
import {BaseHobbyPhotoScreen} from '@/src/components/hobby/BaseHobbyPhotoScreen';
import {router} from 'expo-router';

export default function AllHobbyPhotosScreen() {
    const {hobbies, hobbyPhotos, hobbyPhotosLoading, hobbyPhotosSyncing, hobbyPhotosError} = useHobby();

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
                <Text variant="bodyLarge">Error loading gallery: {hobbyPhotosError}</Text>
            </View>
        );
    }

    return (
        <View style={styles.screen}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => router.back()}/>
                <Appbar.Content title="All Hobbies Gallery"/>
            </Appbar.Header>
            
            {/* Show progress bar when syncing */}
            {hobbyPhotosSyncing && !hobbyPhotosLoading && (
                <ProgressBar indeterminate style={styles.progressBar} />
            )}

            <BaseHobbyPhotoScreen
                grid="grouped"
                hobbies={hobbies}
                photos={hobbyPhotos}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {flex: 1},
    progressBar: {height: 3},
    centered: {flex: 1, justifyContent: 'center', alignItems: 'center'},
});