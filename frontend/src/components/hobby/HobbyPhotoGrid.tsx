// Shared grid component used by HobbyPhotoGroupedGrid for photos.tsx
// (all photos) and by [hobbyId]/photos.tsx (photos for a specific hobby).
// Photos are sorted by id for deterministic display order.

import React from 'react';
import {View, StyleSheet, Alert} from 'react-native';
import {HobbyPhotoResponse} from '@/src/types/hobby';
import {HobbyPhotoCard} from './HobbyPhotoCard';
import {spacing} from '@/src/theme';

interface Props {
    photos: HobbyPhotoResponse[];
    onPress: (photo: HobbyPhotoResponse) => void;
    onEdit: (photo: HobbyPhotoResponse) => void;
    onDelete: (photo: HobbyPhotoResponse) => void;
}

export const HobbyPhotoGrid = ({photos, onPress, onEdit, onDelete}: Props) => {
    const confirmDelete = (photo: HobbyPhotoResponse) => {
        Alert.alert(
            'Remove Photo',
            'Are you sure you want to remove this photo?',
            [
                {text: 'Cancel', style: 'cancel'},
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            onDelete(photo);
                        } catch (e: unknown) {
                            Alert.alert('Error', e instanceof Error ? e.message : 'An unexpected error occurred');
                        }
                    },
                },
            ]
        );
    };

    //ensure deterministic ordering
    const sorted = [...photos].sort((a, b) => a.id.localeCompare(b.id));

    return (
        <View style={styles.grid}>
            {sorted.map(photo => (
                <HobbyPhotoCard
                    key={photo.id}
                    photo={photo}
                    hobbyName={photo.hobbyName}
                    onPress={() => onPress(photo)}
                    onEdit={() => onEdit(photo)}
                    onDelete={() => confirmDelete(photo)}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    grid: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, padding: spacing.lg},
});