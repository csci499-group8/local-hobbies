// Shares use of a dedicated SavedMatch action hook (useSavedMatchActions)
// with saved-matches.tsx

import React, {useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {ActivityIndicator, Text, Appbar, Portal, Modal} from 'react-native-paper';
import {useRouter} from 'expo-router';
import {useMatch} from '@/src/hooks/useMatch';
import {MutualMatchCard} from '@/src/components/match/MutualMatchCard';
import {SavedMatchForm} from '@/src/components/match/SavedMatchForm';
import {MutualMatchResponse} from '@/src/types/match';
import {useSavedMatchActions} from "@/src/hooks/useSavedMatchActions";
import {commonStyles} from "@/src/theme";

type ActiveMatchState =
    | {type: 'CLOSED'}
    | {type: 'EDITING'; match: MutualMatchResponse};

export default function MutualMatchesScreen() {
    const router = useRouter();
    const { mutualMatches, mutualMatchesLoading, mutualMatchesError } = useMatch();
    const { isSubmitting, handleUpdateNotes, handleDelete } = useSavedMatchActions();
    const [activeMatchState, setActiveMatchState] = useState<ActiveMatchState>({ type: 'CLOSED' });

    if (mutualMatchesLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (mutualMatchesError || !mutualMatches) {
        return (
            <View style={styles.centered}>
                <Text variant="bodyLarge">Error loading matches: {mutualMatchesError}</Text>
            </View>
        );
    }

    return (
        <View style={styles.screen}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Content title="Mutual Matches" />
            </Appbar.Header>

            <ScrollView contentContainerStyle={styles.list}>
                {mutualMatches.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text variant="bodyLarge">You don't have any mutual matches yet.</Text>
                        <Text variant="bodyMedium" style={styles.emptySubtext}>
                            When someone you've saved saves you back, they'll appear here.
                        </Text>
                    </View>
                ) : (
                    mutualMatches.map(match => (
                        <MutualMatchCard
                            key={match.currentUserMatchId}
                            match={match}
                            onEditNotes={() => setActiveMatchState({type: 'EDITING', match})}
                            onDelete={() => handleDelete(match.currentUserMatchId, match.savedUser.name)}
                        />
                    ))
                )}
            </ScrollView>

            <Portal>
                <Modal
                    visible={activeMatchState.type !== 'CLOSED'}
                    onDismiss={() => !isSubmitting && setActiveMatchState({type: 'CLOSED'})}
                    contentContainerStyle={styles.modal}
                >
                    {activeMatchState.type === 'EDITING' && (
                        <SavedMatchForm
                            mode="edit"
                            userName={activeMatchState.match.savedUser.name}
                            initialNotes={activeMatchState.match.notes}
                            onDismiss={() => setActiveMatchState({type: 'CLOSED'})}
                            isSubmitting={isSubmitting}
                            onSubmit={(notes) =>
                                handleUpdateNotes(activeMatchState.match.currentUserMatchId, notes, () =>
                                    setActiveMatchState({ type: 'CLOSED' })
                                )
                            }
                        />
                    )}
                </Modal>
            </Portal>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {flex: 1},
    centered: {flex: 1, justifyContent: 'center', alignItems: 'center'},
    list: {padding: 16, paddingBottom: 100},
    emptyContainer: {marginTop: 100, alignItems: 'center', gap: 12},
    emptySubtext: {opacity: 0.6, textAlign: 'center'},
    modal: {backgroundColor: 'white', margin: 24, borderRadius: 12, padding: 24},
});