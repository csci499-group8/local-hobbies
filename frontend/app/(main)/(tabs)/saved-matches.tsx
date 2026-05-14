// Shares use of a dedicated SavedMatch action hook (useSavedMatchActions)
// with mutual-matches.tsx

import React, {useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {ActivityIndicator, Text, Appbar, Button, Portal, Modal} from 'react-native-paper';
import {useRouter} from 'expo-router';
import {useMatch} from '@/src/hooks/useMatch';
import {SavedMatchCard} from '@/src/components/match/SavedMatchCard';
import {SavedMatchForm} from '@/src/components/match/SavedMatchForm';
import {SavedMatchResponse} from '@/src/types/match';
import {useSavedMatchActions} from "@/src/hooks/useSavedMatchActions";
import {spacing} from '@/src/theme';

type ActiveMatchState =
    | {type: 'CLOSED'}
    | {type: 'EDITING'; match: SavedMatchResponse};

export default function SavedMatchesScreen() {
    const router = useRouter();
    const {savedMatches, savedMatchesLoading, savedMatchesError} = useMatch();
    const {isSubmitting, handleUpdateNotes, handleDelete} = useSavedMatchActions();
    const [activeMatchState, setActiveMatchState] = useState<ActiveMatchState>({type: 'CLOSED'});

    if (savedMatchesLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (savedMatchesError || !savedMatches) {
        return (
            <View style={styles.centered}>
                <Text variant="bodyLarge">Error loading matches: {savedMatchesError}</Text>
            </View>
        );
    }

    return (
        <View style={styles.screen}>
            <Appbar.Header>
                <Appbar.Content title="Saved Matches" />
                <Button
                    mode="outlined"
                    textColor="#fff"
                    onPress={() => router.push('/mutual-matches')}
                    style={styles.appbarButton}
                >
                    <Text>Mutual Matches</Text>
                </Button>
                {/* <Appbar.Action
                    icon="bookmark-check" //handshake?
                    onPress={() => router.push('/mutual-matches')}
                /> */}
            </Appbar.Header>

            <ScrollView contentContainerStyle={styles.list}>
                {savedMatches.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text variant="bodyLarge">You haven't saved anyone as a match yet.</Text>
                        <Text variant="bodyMedium" style={styles.emptySubtext}>
                            Find people to connect with on the Discover tab.
                        </Text>
                    </View>
                ) : (
                    savedMatches.map(match => (
                        <SavedMatchCard
                            key={match.id}
                            match={match}
                            onEditNotes={() => setActiveMatchState({type: 'EDITING', match})}
                            onDelete={() => handleDelete(match.id, match.savedUser.name)}
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
                                handleUpdateNotes(activeMatchState.match.id, notes, () =>
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
    screen: {flex: 1, backgroundColor: '#f8f9fa'},
    centered: {flex: 1, justifyContent: 'center', alignItems: 'center'},
    list: {padding: 16, paddingBottom: 100},
    emptyContainer: {marginTop: 100, alignItems: 'center', gap: 12},
    emptySubtext: {opacity: 0.6, textAlign: 'center'},
    appbarButton: {marginRight: spacing.sm},
    modal: {backgroundColor: 'white', margin: 24, borderRadius: 12, padding: 24},
});