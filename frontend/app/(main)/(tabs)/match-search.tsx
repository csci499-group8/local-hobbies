import React, {useState, useMemo} from 'react';
import {ScrollView, StyleSheet, View, Alert} from 'react-native';
import {ActivityIndicator, Text, Appbar, Portal, Modal, ProgressBar} from 'react-native-paper';
import {useMatch, useMatchSearch} from '@/src/hooks/useMatch';
import {MatchSearchForm} from '@/src/components/match/MatchSearchForm';
import {MatchSearchResultCard} from '@/src/components/match/MatchSearchResultCard';
import {SavedMatchForm} from '@/src/components/match/SavedMatchForm';
import {MatchSearchResultResponse} from '@/src/types/match';
import {useGlobalHobby} from "@/src/hooks/useGlobalHobby";
import {useHobby} from '@/src/hooks/useHobby';
import {colors, spacing} from '@/src/theme';

type ActiveSaveState =
    | {type: 'CLOSED'}
    | {type: 'SAVING'; result: MatchSearchResultResponse};

export default function MatchSearchScreen() {
    const {globalHobbies, globalHobbiesLoading} = useGlobalHobby();
    
    // Allow users to only search for matches in hobbies they participate in
    const {hobbies, hobbiesLoading} = useHobby();
    const userHobbyNames = new Set(hobbies.map(h => h.name));
    const userGlobalHobbies = globalHobbies.filter(h => userHobbyNames.has(h.name));

    const {searchResults, searchLoading, searchError, searchForMatches} = useMatchSearch();
    const [hasSearched, setHasSearched] = useState(false);

    const {savedMatches, savedMatchesLoading, savedMatchesFetching, createSavedMatch} = useMatch();
    const [activeSaveState, setActiveSaveState] = useState<ActiveSaveState>({type: 'CLOSED'});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const savedUserIds = useMemo(() => {
        return new Set(savedMatches.map(m => m.savedUser.id));
    }, [savedMatches]);

    const handleSearch = async (request: Parameters<typeof searchForMatches>[0]) => {
        setHasSearched(true);
        try {
            await searchForMatches(request);
        } catch (e: unknown) {
            Alert.alert('Error', e instanceof Error ? e.message : 'An unexpected error occurred');
        }
    };

    const handleSave = async (notes: string | null) => {
        if (activeSaveState.type !== 'SAVING') return;
        const userId = activeSaveState.result.matchedUser.id;
        setIsSubmitting(true);
        try {
            await createSavedMatch({
                savedUserId: userId,
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
                <Appbar.Content title="Discover Matching Users" />
            </Appbar.Header>
            
            {/* Show progress bar when refetching saved matches */}
            {savedMatchesFetching && !savedMatchesLoading && (
                <ProgressBar indeterminate style={styles.progressBar} />
            )}

            <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
                <MatchSearchForm
                    globalHobbies={userGlobalHobbies}
                    globalHobbiesLoading={globalHobbiesLoading || hobbiesLoading}
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

                {!hasSearched && !searchLoading && (
                    <View style={styles.emptyContainer}>
                        <Text variant="bodyMedium" style={styles.emptyText}>
                            Fill in the search form above to find matches.
                        </Text>
                    </View>
                )}

                {hasSearched && !searchLoading && searchResults.length === 0 && (
                    <View style={styles.noResultsContainer}>
                        <Text variant="bodyLarge" style={styles.noResultsText}>
                            No matches found.
                        </Text>
                        <Text variant="bodyMedium" style={styles.noResultsHint}>
                            Try adjusting your filters or expanding your search area.
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
    screen: {flex: 1},
    progressBar: {height: 3},
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
    modal: {backgroundColor: 'white', margin: 24, borderRadius: 12, padding: 24},
    emptyContainer: {alignItems: 'center', marginTop: 48},
    emptyText: {opacity: 0.6, textAlign: 'center'}, //fontStyle: 'italic',
    noResultsContainer: {padding: spacing.xxl, alignItems: 'center', gap: spacing.sm},
    noResultsText: {textAlign: 'center'}, //fontWeight: '600',
    noResultsHint: {opacity: 0.6, textAlign: 'center'}, //, lineHeight: 20
});