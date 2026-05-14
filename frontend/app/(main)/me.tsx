import React from 'react';
import {View, ScrollView, StyleSheet} from 'react-native';
import {ActivityIndicator, Text, Appbar, Divider, Button, IconButton} from 'react-native-paper';
import {useRouter} from 'expo-router';
import {useUser} from '@/src/hooks/useUser';
import {ProfileHeader} from '@/src/components/user/profile-view/ProfileHeader';
import {ProfileBio} from '@/src/components/user/profile-view/ProfileBio';
import {ProfileHobbies} from '@/src/components/user/profile-view/ProfileHobbies';
import {ProfileHobbyPhotos} from '@/src/components/user/profile-view/ProfileHobbyPhotos';
import {ProfileContactInfo} from '@/src/components/user/profile-view/ProfileContactInfo';

export default function MeScreen() {
    const router = useRouter();
    const {currentUserProfile, currentUserProfileLoading, currentUserProfileError} = useUser();

    if (currentUserProfileLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (currentUserProfileError || !currentUserProfile) {
        return (
            <View style={styles.centered}>
                <Text variant="bodyLarge">
                    Error loading preview: {currentUserProfileError}
                </Text>
            </View>
        );
    }

    const {
        name,
        age,
        genderDisplayed,
        locationApproximate,
        profilePhotoUrl,
        bio,
        hobbies,
        hobbyPhotos,
        publicContactInfo,
    } = currentUserProfile;

    return (
        <View style={styles.screen}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Content title="Profile Preview" />
                <Appbar.Action icon="pencil" onPress={() => router.push('/edit-profile')} />
                <Appbar.Action icon="cog" onPress={() => router.push('/settings')} />
            </Appbar.Header>

            <ScrollView style={styles.container}>
                <ProfileHeader
                    name={name}
                    age={age}
                    genderDisplayed={genderDisplayed}
                    locationApproximate={locationApproximate}
                    profilePhotoUrl={profilePhotoUrl}
                />

                <Divider style={styles.divider} />

                <ProfileBio bio={bio} />

                {/* 2. Hobbies with Link to hobbies.tsx */}
                <View style={styles.sectionContainer}>
                    <ProfileHobbies hobbies={hobbies} />
                    <Button
                        mode="text"
                        compact
                        icon="pencil"
                        onPress={() => router.push('/hobbies')}
                        style={styles.manageButton}
                    >
                        <Text>Manage Hobbies</Text>
                    </Button>
                </View>

                {/* 3. Photos with link to hobbies/photos.tsx */}
                <View style={styles.sectionContainer}>
                    <ProfileHobbyPhotos hobbyPhotos={hobbyPhotos} />
                    <Button
                        mode="text"
                        compact
                        icon="camera"
                        onPress={() => router.push('/hobbies/photos')}
                        style={styles.manageButton}
                    >
                        <Text>Manage Photos</Text>
                    </Button>
                </View>

                <Divider style={styles.divider} />

                <ProfileContactInfo publicContactInfo={publicContactInfo} />

                <Text variant="labelSmall" style={styles.footerNote}>
                    This is how your profile appears to other users.
                </Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {flex: 1},
    container: {flex: 1, backgroundColor: '#fff'},
    centered: {flex: 1, justifyContent: 'center', alignItems: 'center'},
    divider: {marginHorizontal: 32},
    sectionContainer: {position: 'relative', paddingBottom: 8},
    // settingsButton: {position: 'absolute', top: 8, right: 8, backgroundColor: '#f0f0f0'},
    manageButton: {alignSelf: 'center', marginTop: -8, marginBottom: 8},
    footerNote: {
        textAlign: 'center',
        marginVertical: 32,
        opacity: 0.4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
});