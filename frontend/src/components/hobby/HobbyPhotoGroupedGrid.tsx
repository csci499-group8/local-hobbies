// Grid component used by photos.tsx. Groups photos by hobby, then
// displays a HobbyPhotoGrid for each group.

import React from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {Text, Divider} from 'react-native-paper';
import {HobbyPhotoResponse} from '@/src/types/hobby';
import {HobbyPhotoGrid} from './HobbyPhotoGrid';
import {spacing, commonStyles} from '@/src/theme';

interface Props {
    photos: HobbyPhotoResponse[];
    onPress: (photo: HobbyPhotoResponse) => void;
    onEdit: (photo: HobbyPhotoResponse) => void;
    onDelete: (photo: HobbyPhotoResponse) => void;
}

export const HobbyPhotoGroupedGrid = ({photos, onPress, onEdit, onDelete}: Props) => {
    //group by hobby
    const groups = new Map<string, HobbyPhotoResponse[]>();
    photos.forEach(photo => {
        if (!groups.has(photo.hobbyName)) groups.set(photo.hobbyName, []);
        groups.get(photo.hobbyName)!.push(photo);
    });

    const sortedGroupNames = Array.from(groups.keys()).sort();

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {sortedGroupNames.map((name, index) => (
                <View key={name} style={styles.section}>
                    {/*{index > 0 && <Divider style={styles.divider} />}*/}
                    <Text variant="labelLarge" style={styles.groupHeader}>
                        {name}
                    </Text>
                    <HobbyPhotoGrid
                        photos={groups.get(name)!}
                        onPress={photo => onPress(photo)}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {},
    section: {marginBottom: spacing.lg},
    groupHeader: {
        ...commonStyles.upperLabel,
        // marginBottom: spacing.md,
        paddingTop: spacing.lg,
        paddingHorizontal: spacing.lg,
        fontWeight: 'bold',
        letterSpacing: 1.5,
    },
    // divider: {marginBottom: spacing.xxl, marginTop: spacing.sm},
});