// Displays a match search result with user info, distance, overlapping
// availabilities, and actions to view profile or save the match.
// Saving opens a SavedMatchForm modal for adding notes at creation time.

import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {Card, Text, Button, Chip} from 'react-native-paper';
import {useRouter} from 'expo-router';
import {MatchSearchResultResponse, MatchDistanceType} from '@/src/types/match';
import {MatchedUserHeader} from '@/src/components/match/match-card/MatchedUserHeader';
import {AvailabilityCalendar} from '@/src/components/availability/AvailabilityCalendar';
import {spacing, commonStyles, theme} from '@/src/theme';

interface Props {
    result: MatchSearchResultResponse;
    onSave: () => void;
    isSaved: boolean;
}

export const MatchSearchResultCard = ({result, onSave, isSaved}: Props) => {
    const router = useRouter();
    const [showAvailability, setShowAvailability] = useState(false);

    const distanceLabel = result.distanceType === MatchDistanceType.Home
        ? `${result.distanceKilometers.toFixed(1)} km away (home)`
        : `${result.distanceKilometers.toFixed(1)} km away (nearest overlap)`;

    return (
        <Card style={styles.card} mode="outlined">
            <Card.Content style={styles.content}>

                <MatchedUserHeader user={result.matchedUser} />

                {/* TODO: styling? icon? */}
                {result.hasSavedCurrentUser && (
                    <Chip compact icon="bookmark-check" style={styles.mutualChip}>
                        This user has already saved you!
                    </Chip>
                )}

                <Chip compact icon="map-marker" style={styles.distanceChip} textStyle={{color: theme.colors.primary}}>
                    {distanceLabel}
                </Chip>

                {/* Collapsible availability — avoids massive cards when
                    multiple results are shown simultaneously */}
                {result.overlappingAvailabilities.length > 0 && (
                    <View>
                        <Button
                            mode="text"
                            compact
                            icon={showAvailability ? 'chevron-up' : 'chevron-down'}
                            onPress={() => setShowAvailability(prev => !prev)}
                            style={styles.availabilityToggle}
                        >
                            {showAvailability ? 'Hide when you\'re both free' : 'Show when you\'re both free (next 30 days)'}
                        </Button>
                        {showAvailability && (
                            <View>
                            {/*<View style={styles.calendarContainer}>*/}
                                <AvailabilityCalendar
                                    mode="overlap"
                                    intervals={result.overlappingAvailabilities}
                                />
                            </View>
                        )}
                    </View>
                )}

                <View style={styles.cardActions}>
                    <Button
                        mode="contained"
                        icon="account"
                        onPress={() => router.push({
                            pathname: '/[userId]',
                            params: {userId: result.matchedUser.id},
                        })}
                        style={styles.actionButton}
                        textColor={theme.colors.onPrimary}
                    >
                        View Profile
                    </Button>
                    <Button
                        mode={isSaved ? 'outlined' : 'contained'}
                        icon={isSaved ? 'bookmark' : 'bookmark-outline'} //bookmark-check + bookmark-plus?
                        onPress={onSave}
                        disabled={isSaved}
                        style={{
                            flex: 1,
                            backgroundColor: isSaved ? theme.colors.surfaceVariant : theme.colors.primary,
                            borderWidth: isSaved ? 1 : 0,
                            borderColor: theme.colors.surface,
                        }}
                        // textColor is overridden by Paper's disabled theming; labelStyle bypasses it
                        labelStyle={isSaved ? {color: theme.colors.surface} : {color: theme.colors.onPrimary}}
                    >
                        {isSaved ? 'Saved' : 'Save Match'}
                    </Button>
                </View>

            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {marginBottom: spacing.md, ...commonStyles.card},
    content: {gap: spacing.md},
    mutualChip: {alignSelf: 'flex-start', backgroundColor: theme.colors.tertiary},
    distanceChip: {alignSelf: 'flex-start', backgroundColor: theme.colors.tertiaryContainer, borderColor: theme.colors.tertiary},
    availabilityToggle: {alignSelf: 'flex-start'},
    cardActions: {flexDirection: 'row', gap: spacing.sm},
    actionButton: {flex: 1, backgroundColor: theme.colors.primary},
});