// Full-screen photo viewer shown when a photo is tapped.

import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Modal, Portal, Text, IconButton} from 'react-native-paper';
import {Image} from 'expo-image';
import {HobbyPhotoResponse} from '@/src/types/hobby';

interface Props {
    photo: HobbyPhotoResponse | null;
    onDismiss: () => void;
}

export const HobbyPhotoExpandedModal = ({photo, onDismiss}: Props) => (
    <Portal>
        <Modal
            visible={!!photo}
            onDismiss={onDismiss}
            contentContainerStyle={styles.modal}
        >
            {photo && (
                <>
                    <View style={styles.header}>
                        <Text variant="titleMedium" style={styles.hobbyName}>
                            {photo.hobbyName}
                        </Text>
                        <IconButton icon="close" onPress={onDismiss} iconColor="#fff" />
                    </View>
                    <Image
                        source={{uri: photo.photoUrl}}
                        style={styles.image}
                        contentFit="contain"
                        transition={200}
                    />
                    {photo.caption && (
                        <Text variant="bodyMedium" style={styles.caption}>
                            {photo.caption}
                        </Text>
                    )}
                </>
            )}
        </Modal>
    </Portal>
);

const styles = StyleSheet.create({
    modal: {backgroundColor: '#000', margin: 0, flex: 1, justifyContent: 'center'},
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 48,
    },
    hobbyName: {color: '#fff', fontWeight: 'bold'},
    image: {width: '100%', aspectRatio: 1, backgroundColor: '#111'},
    caption: {
        color: 'rgba(255,255,255,0.7)',
        fontStyle: 'italic',
        textAlign: 'center',
        padding: 16,
    },
});