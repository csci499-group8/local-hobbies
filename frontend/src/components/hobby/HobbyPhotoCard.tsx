// Card composing HobbyPhotoItem with an edit/delete overlay.
// Used by HobbyPhotoGrid on management screens.

import React from 'react';
import {View, StyleSheet, Pressable} from 'react-native';
import {IconButton, useTheme, Text} from 'react-native-paper';
import {HobbyPhotoResponse} from '@/src/types/hobby';
import {HobbyPhotoItem} from './HobbyPhotoItem';
import {colors, spacing} from '@/src/theme';

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

                {/* Hobby label overlay */}
                <View style={styles.topLabel}>
                    <Text variant="labelSmall" style={styles.hobbyText}>
                        {hobbyName}
                    </Text>
                </View>

                {/* Action buttons overlay */}
                <View style={styles.actionOverlay}>
                    <IconButton
                        icon="pencil"
                        size={20}
                        iconColor={theme.colors.primary}
                        // containerColor="rgba(0,0,0,0.5)"
                        onPress={onEdit}
                        style={styles.iconButton}
                    />
                    <IconButton
                        icon="delete"
                        size={20}
                        iconColor={theme.colors.errorContainer}
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
        backgroundColor: '#fff',
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        marginBottom: spacing.md,
    },
    imageContainer: {width: '100%', aspectRatio: 1, position: 'relative'},
    topLabel: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        zIndex: 10,
    },
    hobbyText: {color: '#fff', fontWeight: 'bold', fontSize: 10},
    actionOverlay: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        flexDirection: 'row',
        zIndex: 20, //ensure buttons are above the image pressable
    },
    iconButton: {margin: 2, backgroundColor: "rgba(0,0,0,0.5)"},
    captionArea: {padding: spacing.sm},
    captionText: {color: colors.textSecondary, fontStyle: 'italic'},
    hobbyName: { fontWeight: 'bold' }
});

//TODO:
// export const HobbyPhotoCard = ({photo, hobbyName, onPress, onEdit, onDelete}: Props) => {
//     const theme = useTheme();
//
//     return (
//         <View style={styles.card}>
//                 <HobbyPhotoItem photo={photo} onPress={onPress} />
//
//                 {/* Overlay at bottom — hobby name only, no caption here */}
//                 <View style={styles.overlay}>
//                     <Text
//                         variant="labelMedium"
//                         style={styles.overlayHobbyName}
//                         numberOfLines={1}
//                     >
//                         {hobbyName}
//                     </Text>
//
//                     {/* Actions grouped tightly on the right */}
//                     <View style={styles.actions}>
//                         <IconButton
//                             icon="pencil"
//                             size={18}
//                             iconColor="#fff"
//                             style={styles.actionIcon}
//                             onPress={onEdit}
//                         />
//                         <IconButton
//                             icon="delete"
//                             size={18}
//                             iconColor="#fff"
//                             style={styles.actionIcon}
//                             onPress={onDelete}
//                         />
//                     </View>
//                 </View>
//
//                 {/* Caption below image, not in overlay */}
//                 {photo.caption && (
//                     <Text
//                         variant="bodySmall"
//                         style={styles.caption}
//                         numberOfLines={2}
//                     >
//                         {photo.caption}
//                     </Text>
//                 )}
// {/*
//             <HobbyPhotoItem photo={photo} onPress={onPress} />
//             <View style={styles.overlay}>
//                 <IconButton
//                     icon="pencil"
//                     size={18}
//                     iconColor="#fff"
//                     onPress={onEdit}
//                 />
//                 <IconButton
//                     icon="delete"
//                     size={18}
//                     iconColor={theme.colors.errorContainer}
//                     onPress={onDelete}
//                 />
//             </View>
// */}
//         </View>
//     );
// };
//
// const styles = StyleSheet.create({
//     card: {width: '48%', borderRadius: 12, overflow: 'hidden'},
//     overlay: {
//         position: 'absolute',
//         bottom: 0,
//         left: 0,
//         right: 0,
//         backgroundColor: 'rgba(0,0,0,0.5)',
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         paddingLeft: spacing.sm,
//         paddingRight: 0,
//         paddingVertical: 0,
//     },
//     overlayHobbyName: {
//         color: '#fff',
//         fontWeight: '600',
//         flex: 1,
//     },
//     actions: {
//         flexDirection: 'row',
//         gap: 0,
//     },
//     actionIcon: {
//         margin: 0,
//         padding: 0,
//     },
//     caption: {
//         color: colors.textSecondary,
//         paddingHorizontal: spacing.sm,
//         paddingTop: spacing.xs,
//         paddingBottom: spacing.sm,
//     },
// });
// // const styles = StyleSheet.create({
// //     card: {width: '48%'},
// //     overlay: {
// //         position: 'absolute',
// //         bottom: 0,
// //         left: 0,
// //         right: 0,
// //         backgroundColor: 'rgba(0,0,0,0.45)',
// //         flexDirection: 'row',
// //         justifyContent: 'flex-end',
// //         borderBottomLeftRadius: 12,
// //         borderBottomRightRadius: 12,
// //     },
// // });