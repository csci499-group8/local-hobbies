// components/matches/OverlappingHobbiesRow.tsx
import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Chip, Text} from 'react-native-paper';
import {HobbyOverlapResponse} from '@/src/types/hobby';
import {spacing, commonStyles, theme} from '@/src/theme';

interface Props {
    overlappingHobbies: HobbyOverlapResponse[];
}

export const MatchOverlappingHobbies = ({overlappingHobbies}: Props) => {
    if (overlappingHobbies.length === 0) return null;

    return (
        <View style={styles.container}>
            <Text variant="labelSmall" style={styles.label}>Shared hobbies</Text>
            <View style={styles.chipRow}>
                {overlappingHobbies.map(hobby => (
                    <Chip key={hobby.name} compact mode="flat" style={styles.chip}>
                        {hobby.name}
                    </Chip>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {gap: spacing.xs + 2},
    label: commonStyles.upperLabel,
    chipRow: commonStyles.chipRow,
    chip: {backgroundColor: theme.colors.surfaceInput},
});