// Card composing HobbyPhotoItem with an edit/delete overlay.
// Used by HobbyPhotoGrid on management screens.

import React from 'react';
import {View, StyleSheet} from 'react-native';
import {IconButton, useTheme} from 'react-native-paper';
import {HobbyPhotoResponse} from '@/src/types/hobby';
import {HobbyPhotoItem} from './HobbyPhotoItem';

interface Props {
    photo: HobbyPhotoResponse;
    onPress: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

export const HobbyPhotoCard = ({photo, onPress, onEdit, onDelete}: Props) => {
    const theme = useTheme();

    return (
        <View style={styles.card}>
            <HobbyPhotoItem photo={photo} onPress={onPress} />
            <View style={styles.overlay}>
                <IconButton
                    icon="pencil"
                    size={18}
                    iconColor="#fff"
                    onPress={onEdit}
                />
                <IconButton
                    icon="delete"
                    size={18}
                    iconColor={theme.colors.errorContainer}
                    onPress={onDelete}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {width: '48%'},
    overlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.45)',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
    },
});