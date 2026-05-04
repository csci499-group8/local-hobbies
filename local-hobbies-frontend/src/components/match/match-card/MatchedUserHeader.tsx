import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text, Avatar} from 'react-native-paper';
import {Image} from 'expo-image';
import {DateTime} from 'luxon';
import {MatchedUser} from '@/src/types/match';

interface Props {
    user: MatchedUser;
}

export const MatchedUserHeader = ({user}: Props) => {
    const lastSeen = DateTime.fromISO(user.lastSessionTime).toRelative();

    return (
        <View style={styles.container}>
            {user.profilePhotoUrl ? (
                <Image
                    source={{uri: user.profilePhotoUrl}}
                    style={styles.photo}
                    contentFit="cover"
                    transition={200}
                />
            ) : (
                <Avatar.Icon size={56} icon="account" />
            )}
            <View style={styles.info}>
                <Text variant="titleMedium" style={styles.name}>{user.name}</Text>
                <Text variant="bodySmall" style={styles.lastSeen}>
                    Active {lastSeen}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {flexDirection: 'row', alignItems: 'center', gap: 12},
    photo: {width: 56, height: 56, borderRadius: 28, backgroundColor: '#e0e0e0'},
    info: {flex: 1, gap: 2},
    name: {fontWeight: 'bold'},
    lastSeen: {opacity: 0.5},
});