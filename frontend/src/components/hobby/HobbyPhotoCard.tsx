// Card composing HobbyPhotoItem with an edit/delete overlay.
// Used by HobbyPhotoGrid on management screens.

import React from 'react';
import {View, StyleSheet, Pressable} from 'react-native';
import {IconButton, useTheme, Text} from 'react-native-paper';
import {HobbyPhotoResponse} from '@/src/types/hobby';
import {HobbyPhotoItem} from './HobbyPhotoItem';
import {theme, colors, spacing} from '@/src/theme';

interface Props {
    photo: HobbyPhotoResponse;
    hobbyName: string;
    onPress: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

export const HobbyPhotoCard = ({
                                   photo,
                                   hobbyName,
                                   onEdit,
                                   onDelete,
                                   onPress
                               }: Props) => {
    const theme = useTheme();

    return (
        <View style={styles.card}>

            <View style={styles.imageContainer}>
                {/* Skip HobbyPhotoItem's internal onPress to avoid conflicts */}
                <HobbyPhotoItem photo={photo} />

                {/* Action buttons overlay */}
                <View style={styles.actionOverlay}>
                    <IconButton
                        icon="pencil"
                        size={20}
                        iconColor={'white'}
                        onPress={onEdit}
                        style={styles.iconButton}
                    />
                    <IconButton
                        icon="delete"
                        size={20}
                        iconColor={colors.cancelled}
                        onPress={onDelete}
                        style={styles.iconButton}
                    />
                </View>

                {/* Pressable area just for viewing the image */}
                <Pressable style={StyleSheet.absoluteFill} onPress={onPress} />
            </View>

            {/* Caption */}
            {photo.caption && (
                <View style={styles.captionArea}>
                    <Text variant="bodySmall" style={styles.captionText} numberOfLines={2}>
                        {photo.caption}
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        width: '48%',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: spacing.md,
    },
    imageContainer: {width: '100%', aspectRatio: 1, position: 'relative'},
    actionOverlay: {
        position: 'absolute',
        top: 4,
        left: 4,
        flexDirection: 'row',
        zIndex: 20, //ensure buttons are above the image pressable
    },
    iconButton: {margin: 2, backgroundColor: '#4A008098'},
    captionArea: {padding: spacing.sm},
    captionText: {color: theme.colors.primary, opacity: 0.6},
});
