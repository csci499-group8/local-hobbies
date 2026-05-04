import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text, Avatar, IconButton} from 'react-native-paper';
import {Image} from 'expo-image';

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
                    style={styles.profileImage}
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
                <IconButton icon="map-marker" size={20} style={styles.inlineIcon} />
                <Text variant="bodyMedium" style={styles.locationText}>
                    {locationApproximate}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    headerSection: {alignItems: 'center', paddingVertical: 24, paddingHorizontal: 16, gap: 4,},
    profileImage: {width: 120, height: 120, borderRadius: 60, marginBottom: 12},
    nameText: {fontWeight: 'bold'},
    subHeaderText: {opacity: 0.7},
    locationRow: {flexDirection: 'row', alignItems: 'center', marginTop: 4, opacity: 0.6},
    inlineIcon: {margin: 0, padding: 0},
    locationText: {marginLeft: -4},
});