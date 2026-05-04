// components/matches/OverlappingHobbiesRow.tsx
import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Chip, Text} from 'react-native-paper';
import {HobbyOverlapResponse} from '@/src/types/hobby';

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
    container: {gap: 6},
    label: {opacity: 0.5, textTransform: 'uppercase', letterSpacing: 1},
    chipRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 6},
    chip: {backgroundColor: '#f0f0f0'},
});