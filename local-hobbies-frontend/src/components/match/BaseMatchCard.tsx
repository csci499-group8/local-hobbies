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
                    <View style={styles.icons}>
                        <IconButton
                            icon="note-edit"
                            size={20}
                            onPress={onEditNotes}
                        />
                        <IconButton
                            icon="delete"
                            size={20}
                            iconColor={theme.colors.error}
                            onPress={onDelete}
                        />
                    </View>
                </View>

                <Text variant="labelSmall" style={styles.timestampLabel}>
                    {timestampLabel}
                </Text>

                <MatchOverlappingHobbies overlappingHobbies={overlappingHobbies} />

                {notes && (
                    <Text variant="bodySmall" style={styles.notes}>
                        {notes}
                    </Text>
                )}

                <Button
                    mode="outlined"
                    icon="account"
                    onPress={() => router.push({
                        pathname: '/[userId]',
                        params: {userId: matchedUser.id},
                    })}
                    style={styles.profileButton}
                >
                    View Profile
                </Button>

            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {marginBottom: 12, backgroundColor: '#fff'},
    content: {gap: 12},
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    icons: {flexDirection: 'row'},
    timestampLabel: {opacity: 0.5, textTransform: 'uppercase', letterSpacing: 1},
    notes: {opacity: 0.7, fontStyle: 'italic'},
    profileButton: {alignSelf: 'stretch'},
});