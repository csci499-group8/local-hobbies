// Read-only photo item used by both ProfileHobbyPhotos (for profile screens) and
// HobbyPhotoCard (for management screens). Owns image, hobby name, and caption rendering.

import React from 'react';
import {StyleSheet, Pressable} from 'react-native';
import {Image} from 'expo-image';
import {HobbyPhotoResponse} from '@/src/types/hobby';

interface Props {
    photo: HobbyPhotoResponse;
    onPress?: () => void;
}

export const HobbyPhotoItem = ({photo, onPress}: Props) => (
    <Pressable onPress={onPress} style={styles.pressable}>
        <Image
            source={{uri: photo.photoUrl}}
            style={styles.image}
            contentFit="cover"
        />
    </Pressable>
);

const styles = StyleSheet.create({
    pressable: {width: '100%', aspectRatio: 1},
    image: {width: '100%', height: '100%', borderRadius: 12},
});