import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text, Chip} from 'react-native-paper';
import {HobbyResponse} from '@/src/types/hobby';
import {commonStyles, theme} from '@/src/theme';

// Optional overlappingHobbyNames set allows [userId].tsx to highlight
// hobbies shared with the current user. me.tsx passes nothing, rendering
// all chips uniformly.
interface Props {
    hobbies: HobbyResponse[];
    overlappingHobbyNames?: Set<string>;
}

export const ProfileHobbies = ({hobbies, overlappingHobbyNames}: Props) => (
    <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Hobbies</Text>
        {hobbies.length > 0 ? (
            <View style={styles.chipContainer}>
                {hobbies.map(hobby => {
                    const isOverlapping = overlappingHobbyNames?.has(hobby.name);
                    return (
                        <Chip
                            key={hobby.id}
                            mode="flat"
                            style={[
                                styles.chip,
                                //if overlaps, override chip style to make chip stand out
                                isOverlapping && styles.overlappingChip,
                            ]}
                            icon={isOverlapping ? 'set-left-center' : undefined} //TODO: add "shared hobbies" label?
                        >
                            <Text>{hobby.name} · {hobby.experienceLevel}</Text>
                        </Chip>
                    );
                })}
            </View>
        ) : (
            <View style={styles.section}>
                <Text variant="titleMedium" style={styles.sectionTitle}>Hobbies</Text>
                <Text variant="bodySmall" style={styles.emptyText}>No hobbies listed.</Text>
            </View>
        )}
    </View>
);

const styles = StyleSheet.create({
    section: commonStyles.section,
    sectionTitle: commonStyles.sectionTitle,
    chipContainer: commonStyles.chipRow,
    chip: {backgroundColor: theme.colors.surfaceInput},
    overlappingChip: {backgroundColor: theme.colors.overlapping, borderWidth: 1.5, borderColor: theme.colors.primary,},
    emptyText: commonStyles.mutedText,
});