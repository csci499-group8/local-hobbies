import React, {useState} from 'react';
import {ScrollView, StyleSheet, View, Alert} from 'react-native';
import {ActivityIndicator, Text, Appbar, Portal, Modal} from 'react-native-paper';
import {useMatch, useMatchSearch} from '@/src/hooks/useMatch';
import {useHobby} from '@/src/hooks/useHobby';
import {MatchSearchForm} from '@/src/components/match/MatchSearchForm';
import {MatchSearchResultCard} from '@/src/components/match/MatchSearchResultCard';
import {SavedMatchForm} from '@/src/components/match/SavedMatchForm';
import {MatchSearchResultResponse} from '@/src/types/match';

type ActiveSaveState =
    | {type: 'CLOSED'}
    | {type: 'SAVING'; result: MatchSearchResultResponse};

export default function MatchSearchScreen() {
    const {globalHobbies, globalHobbiesLoading} = useHobby();
    const {searchResults, searchLoading, searchError, searchForMatches} = useMatchSearch();
    const {savedMatches, createSavedMatch} = useMatch();

    const [activeSaveState, setActiveSaveState] = useState<ActiveSaveState>({type: 'CLOSED'});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Track saved user IDs so cards can show saved state immediately
    const savedUserIds = new Set(savedMatches.map(m => m.savedUser.id));

    const handleSearch = async (request: Parameters<typeof searchForMatches>[0]) => {
        try {
            await searchForMatches(request);
        } catch (e: unknown) {
            Alert.alert('Error', e instanceof Error ? e.message : 'An unexpected error occurred');
        }
    };

    const handleSave = async (notes: string | null) => {
        if (activeSaveState.type !== 'SAVING') return;
        setIsSubmitting(true);
        try {
            await createSavedMatch({
                savedUserId: activeSaveState.result.matchedUser.id,
                notes,
            });
            setActiveSaveState({type: 'CLOSED'});
        } catch (e: unknown) {
            Alert.alert('Error', e instanceof Error ? e.message : 'An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={styles.screen}>
            <Appbar.Header>
                <Appbar.Content title="Discover" />
            </Appbar.Header>

            <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
                <MatchSearchForm
                    globalHobbies={globalHobbies}
                    globalHobbiesLoading={globalHobbiesLoading}
                    onSubmit={handleSearch}
                    isSearching={searchLoading}
                />

                {searchLoading && (
                    <View style={styles.searchingContainer}>
                        <ActivityIndicator size="large" />
                        <Text variant="bodyMedium" style={styles.searchingText}>
                            Finding matches...
                        </Text>
                    </View>
                )}

                {searchError && (
                    <Text variant="bodyMedium" style={styles.errorText}>
                        {searchError}
                    </Text>
                )}

                {!searchLoading && searchResults.length > 0 && (
                    <View style={styles.results}>
                        <Text variant="titleSmall" style={styles.resultsHeader}>
                            {searchResults.length} {searchResults.length === 1 ? 'match' : 'matches'} found
                        </Text>
                        {searchResults.map(result => (
                            <MatchSearchResultCard
                                key={result.matchedUser.id}
                                result={result}
                                isSaved={savedUserIds.has(result.matchedUser.id)}
                                onSave={() => setActiveSaveState({type: 'SAVING', result})}
                            />
                        ))}
                    </View>
                )}

                {!searchLoading && searchResults.length === 0 && searchError === null && (
                    <View style={styles.emptyContainer}>
                        <Text variant="bodyMedium" style={styles.emptyText}>
                            Fill in the search form above to find matches.
                        </Text>
                    </View>
                )}
            </ScrollView>

            <Portal>
                <Modal
                    visible={activeSaveState.type !== 'CLOSED'}
                    onDismiss={() => !isSubmitting && setActiveSaveState({type: 'CLOSED'})}
                    contentContainerStyle={styles.modal}
                >
                    {activeSaveState.type === 'SAVING' && (
                        <SavedMatchForm
                            mode="create"
                            userName={activeSaveState.result.matchedUser.name}
                            onSubmit={handleSave}
                            onDismiss={() => setActiveSaveState({type: 'CLOSED'})}
                            isSubmitting={isSubmitting}
                        />
                    )}
                </Modal>
            </Portal>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {flex: 1, backgroundColor: '#f8f9fa'},
    list: {padding: 16, paddingBottom: 100},
    searchingContainer: {alignItems: 'center', gap: 12, paddingVertical: 32},
    searchingText: {opacity: 0.6},
    errorText: {color: 'red', textAlign: 'center', marginTop: 16},
    results: {gap: 4, marginTop: 16},
    resultsHeader: {
        opacity: 0.6,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    emptyContainer: {alignItems: 'center', marginTop: 48},
    emptyText: {opacity: 0.5, fontStyle: 'italic', textAlign: 'center'},
    modal: {backgroundColor: 'white', margin: 24, borderRadius: 12, padding: 24},
});