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
        <View style={styles.chipContainer}>
            {overlappingHobbies.map(hobby => (
                <Chip
                    key={hobby.name}
                    mode="flat"
                    style={styles.chip}
                    icon={'set-left-center'}
                >
                    {hobby.name}
                </Chip>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    chipContainer: {...commonStyles.chipRow, paddingVertical: spacing.md},
    chip: {backgroundColor: theme.colors.overlapping, borderWidth: 1.5, borderColor: theme.colors.primary,},
});