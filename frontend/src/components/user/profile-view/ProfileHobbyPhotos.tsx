import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {Portal, Text} from 'react-native-paper';
import {HobbyPhotoResponse} from '@/src/types/hobby';
import {HobbyPhotoItem} from "@/src/components/hobby/HobbyPhotoItem";
import {spacing, commonStyles, theme} from '@/src/theme';
import {HobbyPhotoExpandedModal} from "@/src/components/hobby/HobbyPhotoExpandedModal";

interface Props {
    hobbyPhotos: HobbyPhotoResponse[];
}

export const ProfileHobbyPhotos = ({hobbyPhotos}: Props) => {
    const [expandedPhoto, setExpandedPhoto] = useState<HobbyPhotoResponse | null>(null);

    if (hobbyPhotos.length === 0) return null;

    return (
        <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Hobby Photos</Text>
            <View style={styles.photoGrid}>
                {hobbyPhotos.map(photo => (
                    <View key={photo.id} style={styles.photoWrapper}>
                        <View style={styles.imageContainer}>
                            <HobbyPhotoItem
                                photo={photo}
                                onPress={() => setExpandedPhoto(photo)}
                            />
                            {/* Hobby name overlay */}
                            <View style={styles.hobbyNameOverlay}>
                                <Text variant="titleSmall" style={styles.hobbyNameText}>
                                    {photo.hobbyName}
                                </Text>
                            </View>
                        </View>
                        {photo.caption && (
                            <Text variant="bodySmall" style={styles.gridCaption}>
                                {photo.caption}
                            </Text>
                        )}
                    </View>
                ))}
            </View>

            <Portal>
                <HobbyPhotoExpandedModal
                    photo={expandedPhoto}
                    onDismiss={() => setExpandedPhoto(null)}
                />
            </Portal>
        </View>
    );
};

const styles = StyleSheet.create({
    section: commonStyles.section,
    sectionTitle: commonStyles.sectionTitle,
    photoGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md},
    photoWrapper: {width: '47%'},
    imageContainer: {position: 'relative'},
    hobbyNameOverlay: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: '#4A008098',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        zIndex: 10,

    },
    hobbyNameText: {...commonStyles.upperLabel, color: '#fff', fontWeight: 'bold', fontSize: 10},
    gridCaption: {marginTop: 4, opacity: 0.6, },
});