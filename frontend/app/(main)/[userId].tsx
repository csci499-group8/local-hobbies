import React, {useState} from 'react';
import {View, ScrollView, StyleSheet} from 'react-native';
import {ActivityIndicator, Text, Appbar, Divider, Button} from 'react-native-paper';
import {useRouter, useLocalSearchParams} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useOtherUserProfile} from '@/src/hooks/useUser';
import {ProfileHeader} from '@/src/components/user/profile-view/ProfileHeader';
import {ProfileBio} from '@/src/components/user/profile-view/ProfileBio';
import {ProfileHobbies} from '@/src/components/user/profile-view/ProfileHobbies';
import {ProfileHobbyPhotos} from '@/src/components/user/profile-view/ProfileHobbyPhotos';
import {ProfileContactInfo} from '@/src/components/user/profile-view/ProfileContactInfo';
import {AvailabilityCalendar} from '@/src/components/availability/AvailabilityCalendar';

export default function UserProfileScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const {userId} = useLocalSearchParams<{userId: string}>();
    const {otherUserProfile, otherUserProfileLoading, otherUserProfileError} = useOtherUserProfile(userId);
    const [showAvailability, setShowAvailability] = useState(false);

    if (otherUserProfileLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (otherUserProfileError || !otherUserProfile) {
        return (
            <View style={styles.centered}>
                <Text variant="bodyLarge">
                    Error loading profile: {otherUserProfileError}
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
        contactInfo,
        overlappingHobbies,
        overlappingAvailabilities,
    } = otherUserProfile;

    // Build a set of overlapping hobby names for ProfileHobbies to highlight
    const overlappingHobbyNames = new Set(
        overlappingHobbies.map(h => h.name)
    );

    return (
        <View style={styles.screen}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Content title={name} />
            </Appbar.Header>

            <ScrollView
                style={styles.container}
                contentContainerStyle={{paddingBottom: insets.bottom + 16}}
            >
                <ProfileHeader
                    name={name}
                    age={age}
                    genderDisplayed={genderDisplayed}
                    locationApproximate={locationApproximate}
                    profilePhotoUrl={profilePhotoUrl}
                />

                {contactInfo && (
                    <>
                    <Divider style={styles.divider} />
                    <View style={styles.contactSection}>
                        <Text>You're mutual matches!</Text>
                        <ProfileContactInfo contactInfo={contactInfo} />
                    </View>
                    </>
                )}

                <Divider style={styles.divider} />

                <ProfileBio bio={bio} />

                <ProfileHobbies
                    hobbies={hobbies}
                    overlappingHobbyNames={overlappingHobbyNames}
                />

                <ProfileHobbyPhotos hobbyPhotos={hobbyPhotos} />

                <Divider style={styles.divider} />

                {/* Collapsible overlapping availability window */}
                {overlappingAvailabilities.length > 0 && (
                    <View style={styles.availabilitySection}>
                        <Button
                            mode="text"
                            icon={showAvailability ? 'chevron-up' : 'chevron-down'}
                            onPress={() => setShowAvailability(prev => !prev)}
                            style={styles.availabilityToggle}
                        >
                            {showAvailability ? "Hide when you're both free" : "Show when you're both free (next 30 days)"}
                        </Button>

                        {showAvailability && (
                            <View>
                            {/*<View style={styles.calendarContainer}>*/}
                                <AvailabilityCalendar
                                    mode="overlap"
                                    intervals={overlappingAvailabilities}
                                />
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {flex: 1},
    container: {flex: 1},
    centered: {flex: 1, justifyContent: 'center', alignItems: 'center'},
    divider: {marginHorizontal: 32},
    contactSection: {flex: 1, alignItems: 'center', paddingVertical: 24},
    availabilitySection: {paddingHorizontal: 24, paddingVertical: 8},
    availabilityToggle: {alignSelf: 'center'},
    sectionTitle: {fontWeight: 'bold', textAlign: 'center'},
});