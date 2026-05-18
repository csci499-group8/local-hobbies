import React from 'react';
import {View, StyleSheet} from 'react-native';
import {ActivityIndicator, Appbar, ProgressBar} from 'react-native-paper';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {useHobbyPhotosByHobby, useHobby} from '@/src/hooks/useHobby';
import {BaseHobbyPhotoScreen} from '@/src/components/hobby/BaseHobbyPhotoScreen';

export default function HobbySpecificPhotosScreen() {
    const router = useRouter();
    const {hobbyId} = useLocalSearchParams<{hobbyId: string}>();

    const {hobbyPhotos, hobbyPhotosLoading} = useHobbyPhotosByHobby(hobbyId!);
    //TODO: sensible? doesn't seem to have an effect
    // Fetch hobbies and syncing state for the title and progress bar
    const {hobbies, hobbyPhotosSyncing} = useHobby();

    const currentHobby = hobbies.find(h => h.id === hobbyId);

    if (hobbyPhotosLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large"/>
            </View>
        );
    }

    return (
        <View style={styles.screen}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => router.back()}/>
                <Appbar.Content title={currentHobby?.name ? currentHobby.name + ' Gallery' : 'Gallery'}/>
            </Appbar.Header>
            
            {/* Show progress bar when syncing */}
            {hobbyPhotosSyncing && !hobbyPhotosLoading && (
                <ProgressBar indeterminate style={styles.progressBar} />
            )}

            <BaseHobbyPhotoScreen
                grid="flat"
                hobbyId={hobbyId!}
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