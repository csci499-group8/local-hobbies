import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text} from 'react-native-paper';
import {commonStyles} from '@/src/theme';

interface Props {
    bio: string | null;
}

export const ProfileBio = ({bio}: Props) => {
    if (!bio) return null;

    return (
        <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>About Me</Text>
            <Text variant="bodyMedium" style={styles.bodyText}>{bio}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    section: commonStyles.section,
    sectionTitle: commonStyles.sectionTitle,
    bodyText: commonStyles.bodyText,
});