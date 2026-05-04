import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text} from 'react-native-paper';
import {HobbyPhotoResponse} from '@/src/types/hobby';
import {HobbyPhotoItem} from "@/src/components/hobby/HobbyPhotoItem";

interface Props {
    hobbyPhotos: HobbyPhotoResponse[];
}

export const ProfileHobbyPhotos = ({hobbyPhotos}: Props) => {
    if (hobbyPhotos.length === 0) return null;

    return (
        <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Hobby Photos</Text>
            <View style={styles.photoGrid}>
                {hobbyPhotos.map(photo => (
                    <HobbyPhotoItem key={photo.id} photo={photo} />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    section: {paddingHorizontal: 24, paddingVertical: 16, gap: 8},
    sectionTitle: {fontWeight: 'bold'},
    photoGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 12},
});