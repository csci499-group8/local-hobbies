// Shared content for MutualMatchCard and SavedMatchCard.
// Shows matched user info, match time, shared hobbies, notes,
// and actions to view profile, edit notes, or remove the match.

import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Card, Text, IconButton, Button, useTheme} from 'react-native-paper';
import {useRouter} from 'expo-router';
import {MatchedUser} from '@/src/types/match';
import {HobbyOverlapResponse} from '@/src/types/hobby';
import {MatchedUserHeader} from '@/src/components/match/match-card/MatchedUserHeader';
import {MatchOverlappingHobbies} from '@/src/components/match/match-card/MatchOverlappingHobbies';
import {spacing, commonStyles, theme} from '@/src/theme';

interface Props {
    matchedUser: MatchedUser;
    overlappingHobbies: HobbyOverlapResponse[];
    notes: string | null;
    timestampLabel: string; //e.g. "Saved on Apr 3, 2026" or "Matched since Apr 3, 2026"
    onEditNotes: () => void;
    onDelete: () => void;
}

export const BaseMatchCard = ({
    matchedUser,
    overlappingHobbies,
    notes,
    timestampLabel,
    onEditNotes,
    onDelete,
}: Props) => {
    const router = useRouter();
    const theme = useTheme();

    return (
        <Card style={styles.card} mode="outlined">
            <Card.Content style={styles.content}>
                <View style={styles.headerRow}>
                    <MatchedUserHeader user={matchedUser} />
                </View>

                <Text variant="labelSmall" style={styles.timestampLabel}>
                    {timestampLabel}
                </Text>

                <MatchOverlappingHobbies overlappingHobbies={overlappingHobbies} />

                {notes && (
                    <View style={styles.notesContainer}>
                        <Text variant="bodySmall" style={styles.notes}>
                            {notes}
                        </Text>
                    </View>
                )}
            </Card.Content>

            <Card.Actions style={styles.actions}>
                <IconButton
                    icon="delete" //TODO: -outline
                    size={20}
                    onPress={onDelete}
                    style={styles.deleteButton}
                />

                <View style={{ flex: 1 }} />

                <Button
                    mode="text"
                    icon="pencil"
                    onPress={onEditNotes}
                    compact
                >
                    <Text>Notes</Text>
                </Button>
                <Button
                    mode="contained"
                    icon="account"
                    onPress={() => router.push({
                        pathname: '/[userId]',
                        params: {userId: matchedUser.id},
                    })}
                >
                    <Text>View Profile</Text>
                </Button>
            </Card.Actions>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: { marginBottom: spacing.md, ...commonStyles.card, overflow: 'hidden' },
    content: { paddingBottom: 0 },
    headerRow: { flexDirection: 'row', alignItems: 'center' },
    timestampLabel: { ...commonStyles.upperLabel, marginTop: -spacing.sm },
    notesContainer: {
        backgroundColor: '#f5f5f5',
        padding: spacing.sm,
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#ccc'
    },
    notes: { opacity: 0.8, fontStyle: 'italic' },
    actions: {
        paddingHorizontal: spacing.sm,
        paddingBottom: spacing.sm,
        justifyContent: 'flex-end',
    },
    deleteButton: { margin: 0, color: theme.colors.error }
});
// const styles = StyleSheet.create({
//     card: {marginBottom: spacing.md, ...commonStyles.card},
//     content: {gap: spacing.md},
//     headerRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
//     icons: {flexDirection: 'row', alignItems: 'center', marginRight: -6}, //justifyContent: 'flex-end', marginTop: spacing.xs},
//     timestampLabel: commonStyles.upperLabel,
//     notes: {opacity: 0.7, fontStyle: 'italic'},
//     profileButton: {alignSelf: 'stretch'},
// });