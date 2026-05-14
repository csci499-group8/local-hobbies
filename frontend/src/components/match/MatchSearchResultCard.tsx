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
                    <Chip compact icon="bookmark-check" style={styles.distanceChip}>
                        <Text>This user has already saved you!</Text>
                    </Chip>
                )}

                <Chip compact icon="map-marker" style={styles.distanceChip}>
                    <Text>{distanceLabel}</Text>
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
                            {showAvailability ? 'Hide when you\'re both free' : 'Show when you\'re both free'}
                        </Button>
                        {showAvailability && (
                            <View style={styles.calendarContainer}>
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
                        mode="outlined"
                        icon="account"
                        onPress={() => router.push({
                            pathname: '/[userId]',
                            params: {userId: result.matchedUser.id},
                        })}
                        style={styles.actionButton}
                    >
                        <Text>View Profile</Text>
                    </Button>
                    <Button
                        mode={isSaved ? 'outlined' : 'contained'}
                        icon={isSaved ? 'bookmark' : 'bookmark-outline'} //bookmark-check + bookmark-plus?
                        onPress={onSave}
                        disabled={isSaved}
                        style={styles.actionButton}
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
    distanceChip: {alignSelf: 'flex-start'},
    availabilityToggle: {alignSelf: 'flex-start'},
    calendarContainer: {height: 300},
    cardActions: {flexDirection: 'row', gap: spacing.sm},
    actionButton: {flex: 1},
});