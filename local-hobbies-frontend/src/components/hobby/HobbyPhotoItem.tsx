// Read-only photo item used by both ProfileHobbyPhotos (for profile screens) and
// HobbyPhotoCard (for management screens). Owns image, hobby name, and caption rendering.

import React from 'react';
import {StyleSheet, Pressable} from 'react-native';
import {Text} from 'react-native-paper';
import {Image} from 'expo-image';
import {HobbyPhotoResponse} from '@/src/types/hobby';

interface Props {
    photo: HobbyPhotoResponse;
    onPress?: () => void;
}

export const HobbyPhotoItem = ({photo, onPress}: Props) => (
    <Pressable onPress={onPress} style={styles.cell}>
        <Image
            source={{uri: photo.photoUrl}}
            style={styles.image}
            contentFit="cover"
        />
        <Text variant="bodySmall" style={styles.hobbyName}>
            {photo.hobbyName}
        </Text>
        {photo.caption && (
            <Text variant="bodySmall" style={styles.caption}>
                {photo.caption}
            </Text>
        )}
    </Pressable>
);

const styles = StyleSheet.create({
    cell: {width: '48%', gap: 4},
    image: {width: '100%', aspectRatio: 1, borderRadius: 12},
    hobbyName: {fontWeight: 'bold'},
    caption: {opacity: 0.6, fontStyle: 'italic'},
});