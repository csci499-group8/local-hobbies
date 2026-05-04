import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text, Chip} from 'react-native-paper';
import {HobbyResponse} from '@/src/types/hobby';

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
                            icon={isOverlapping ? 'star' : undefined}
                        >
                            {hobby.name} · {hobby.experienceLevel}
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
    section: {paddingHorizontal: 24, paddingVertical: 16, gap: 8},
    sectionTitle: {fontWeight: 'bold'},
    chipContainer: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
    chip: {backgroundColor: '#f0f0f0'},
    overlappingChip: {backgroundColor: '#e8d5f5'},
    emptyText: {fontStyle: 'italic', opacity: 0.5},
});