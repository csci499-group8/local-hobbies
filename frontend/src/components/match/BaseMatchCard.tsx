// Shared content for MutualMatchCard and SavedMatchCard.
// Shows matched user info, match time, shared hobbies, notes,
// and actions to view profile, edit notes, or remove the match.

import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Card, Text, IconButton, Button, useTheme, Chip} from 'react-native-paper';
import {useRouter} from 'expo-router';
import {MatchedUser} from '@/src/types/match';
import {HobbyOverlapResponse} from '@/src/types/hobby';
import {MatchedUserHeader} from '@/src/components/match/match-card/MatchedUserHeader';
import {MatchOverlappingHobbies} from '@/src/components/match/match-card/MatchOverlappingHobbies';
import {ProfileContactInfo} from '@/src/components/user/profile-view/ProfileContactInfo';
import {spacing, commonStyles, theme} from '@/src/theme';
import {MaterialCommunityIcons} from "@expo/vector-icons";

interface Props {
    matchedUser: MatchedUser;
    overlappingHobbies: HobbyOverlapResponse[];
    notes: string | null;
    timestampLabel: string; //e.g. "Saved on Apr 3, 2026" or "Matched since Apr 3, 2026"
    contactInfo?: string;
    onEditNotes: () => void;
    onDelete: () => void;
}

export const BaseMatchCard = ({
    matchedUser,
    overlappingHobbies,
    notes,
    timestampLabel,
    contactInfo,
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

                <Text variant="titleSmall">{timestampLabel}</Text>

                {contactInfo && (
                    <View style={styles.chipContainer}>
                    <Chip
                        mode="flat"
                        style={styles.chip}
                        icon={'contacts'}
                        textStyle={{color: theme.colors.primary}}
                    >
                        Contact information: {contactInfo || 'No contact info provided'}
                    </Chip>
                    </View>
                )}

                <MatchOverlappingHobbies overlappingHobbies={overlappingHobbies} />

                <Text variant="titleSmall" style={styles.notesLabel}>
                    {"Notes: "}
                    <Text style={styles.notes}>
                        {notes}
                    </Text>
                </Text>
            </Card.Content>

            <Card.Actions style={styles.actions}>
                <IconButton
                    icon="delete"
                    mode="contained"
                    iconColor={theme.colors.error}
                    size={24}
                    onPress={onDelete}
                    style={styles.deleteButton}
                />

                <Button
                    mode="contained"
                    icon="pencil"
                    onPress={onEditNotes}
                    compact
                    textColor={theme.colors.primary}
                    style={{backgroundColor: theme.colors.tertiary}}
                >
                    Edit Notes
                </Button>
                <Button
                    mode="contained"
                    icon="account"
                    onPress={() => router.push({
                        pathname: '/[userId]',
                        params: {userId: matchedUser.id},
                    })}
                >
                    View Profile
                </Button>
            </Card.Actions>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: { marginBottom: spacing.md, ...commonStyles.card, overflow: 'hidden' },
    content: { paddingBottom: 0 },
    headerRow: { flexDirection: 'row', alignItems: 'center', paddingBottom: spacing.md },
    label: commonStyles.upperLabel,
    chipContainer: {...commonStyles.chipRow, paddingTop: spacing.md, paddingBottom: spacing.xs},
    chip: {backgroundColor: theme.colors.tertiaryContainer, borderWidth: 1.5, borderColor: theme.colors.tertiary},
    notesLabel: {color: theme.colors.tertiaryDark, paddingVertical: spacing.xs },
    notes: {color: theme.colors.tertiaryDark, fontStyle: 'italic'},
    actions: {
        paddingHorizontal: spacing.sm,
        paddingBottom: spacing.sm,
        justifyContent: 'flex-end',
    },
    deleteButton: { margin: 0, color: theme.colors.error, backgroundColor: theme.colors.tertiary },
});