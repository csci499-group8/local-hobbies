import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text, Avatar} from 'react-native-paper';
import {Image} from 'expo-image';
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {theme} from '@/src/theme';

interface Props {
    name: string;
    age: number | null;
    genderDisplayed: string | null;
    locationApproximate: string;
    profilePhotoUrl: string | null;
}

export const ProfileHeader = ({
                                  name,
                                  age,
                                  genderDisplayed,
                                  locationApproximate,
                                  profilePhotoUrl,
                              }: Props) => {
    const subHeaderText = [age, genderDisplayed].filter(Boolean).join(' · ');

    return (
        <View style={styles.headerSection}>
            {profilePhotoUrl ? (
                <Image
                    source={{uri: profilePhotoUrl}}
                    style={styles.profilePhoto}
                    contentFit="cover"
                />
            ) : (
                <Avatar.Icon size={120} icon="account" />
            )}

            <Text variant="headlineMedium" style={styles.nameText}>
                {name}
            </Text>

            {subHeaderText && (
                <Text variant="bodyLarge" style={styles.subHeaderText}>
                    {subHeaderText}
                </Text>
            )}

            <View style={styles.locationRow}>
                <MaterialCommunityIcons icon="map-marker" size={18} style={styles.inlineIcon} />
                <Text variant="bodyMedium" style={styles.locationText}>
                    {locationApproximate}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    headerSection: {alignItems: 'center', paddingVertical: 30, paddingHorizontal: 16, gap: 4,},
    profilePhoto: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 12,
        borderColor: theme.colors.tertiary,
        borderWidth: 4,
    },
    nameText: {fontWeight: 'bold'},
    subHeaderText: {opacity: 0.6},
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.tertiaryLight,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
    },
    inlineIcon: {margin: 0, padding: 0, color: theme.colors.tertiary},
    locationText: {marginLeft: -4},
});