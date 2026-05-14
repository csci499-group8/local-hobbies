import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import matchService from '@/src/api/services/match-service';
import {
    MatchSearchRequest,
    SavedMatchCreationRequest,
    SavedMatchUpdateRequest,
    SavedMatchResponse, MutualMatchResponse,
} from '@/src/types/match';

export const matchKeys = {
    all: ['match'] as const,
    savedMatches: () => [...matchKeys.all, 'saved'] as const,
    deletedMatches: () => [...matchKeys.all, 'deleted'] as const,
    mutualMatches: () => [...matchKeys.all, 'mutual'] as const,
};

export const useMatch = () => {
    const queryClient = useQueryClient();

    //read queries

    const savedMatchesQuery = useQuery({
        queryKey: matchKeys.savedMatches(),
        queryFn: matchService.getSavedMatches,
    });

    const deletedMatchesQuery = useQuery({
        queryKey: matchKeys.deletedMatches(),
        queryFn: matchService.getDeletedSavedMatches,
    });

    const mutualMatchesQuery = useQuery({
        queryKey: matchKeys.mutualMatches(),
        queryFn: matchService.getMutualMatches,
    });

    //write mutations

    const createSavedMatchMutation = useMutation({
        mutationFn: (request: SavedMatchCreationRequest) => matchService.createSavedMatch(request),
        onSuccess: (newMatch) => {
            queryClient.setQueryData(matchKeys.savedMatches(), (prev: SavedMatchResponse[] | undefined) =>
                [...(prev ?? []), newMatch]
            );
        },
    });

    const updateSavedMatchMutation = useMutation({
        mutationFn: ({matchId, request}: {matchId: string; request: SavedMatchUpdateRequest}) =>
            matchService.updateSavedMatch(matchId, request),
        onSuccess: (updatedMatch) => {
            queryClient.setQueryData(matchKeys.savedMatches(), (prev: SavedMatchResponse[] | undefined) =>
                (prev ?? []).map(m => m.id === updatedMatch.id ? updatedMatch : m)
            );
        },
    });

    const deleteSavedMatchMutation = useMutation({
        mutationFn: (matchId: string) => matchService.deleteSavedMatch(matchId),
        onSuccess: (_, matchId) => {
            const deletedMatch = queryClient.getQueryData<SavedMatchResponse[]>(matchKeys.savedMatches())
                ?.find(m => m.id === matchId);

            //remove deleted match from saved matches
            queryClient.setQueryData(matchKeys.savedMatches(), (prev: SavedMatchResponse[] | undefined) =>
                (prev ?? []).filter(m => m.id !== matchId)
            );

            //add deleted match to deleted matches
            if (deletedMatch) {
                queryClient.setQueryData(matchKeys.deletedMatches(), (prev: SavedMatchResponse[] | undefined) =>
                    [...(prev ?? []), deletedMatch]
                );
            }

            //if present, remove deleted match from mutual matches
            queryClient.setQueryData(matchKeys.mutualMatches(), (prev: MutualMatchResponse[] | undefined) =>
                (prev ?? []).filter(m => m.currentUserMatchId !== matchId)
            );
        },
    });

    const restoreSavedMatchMutation = useMutation({
        mutationFn: (matchId: string) => matchService.restoreSavedMatch(matchId),
        onSuccess: (restoredMatch) => {
            //add restored match to saved matches
            queryClient.setQueryData(matchKeys.savedMatches(), (prev: SavedMatchResponse[] | undefined) =>
                [...(prev ?? []), restoredMatch]
            );

            //remove restored match from deleted matches
            queryClient.setQueryData(matchKeys.deletedMatches(), (prev: SavedMatchResponse[] | undefined) =>
                (prev ?? []).filter(m => m.id !== restoredMatch.id)
            );

            //refresh, since mutual matches may have new entry if the restored match is mutual
            queryClient.invalidateQueries({queryKey: matchKeys.mutualMatches()});
        },
    });

    return {
        //saved matches
        savedMatches: savedMatchesQuery.data ?? [],
        savedMatchesLoading: savedMatchesQuery.isLoading,
        savedMatchesError: savedMatchesQuery.error?.message ?? null,

        //deleted matches
        deletedMatches: deletedMatchesQuery.data ?? [],
        deletedMatchesLoading: deletedMatchesQuery.isLoading,
        deletedMatchesError: deletedMatchesQuery.error?.message ?? null,

        //mutual matches
        mutualMatches: mutualMatchesQuery.data ?? [],
        mutualMatchesLoading: mutualMatchesQuery.isLoading,
        mutualMatchesError: mutualMatchesQuery.error?.message ?? null,

        //write operations
        createSavedMatch: createSavedMatchMutation.mutateAsync,
        updateSavedMatch: updateSavedMatchMutation.mutateAsync,
        deleteSavedMatch: deleteSavedMatchMutation.mutateAsync,
        restoreSavedMatch: restoreSavedMatchMutation.mutateAsync,
    };
};

/**
 * Separate hook for match search since it is query parameter-driven rather
 * than a static fetch, and screens control when searches are executed
 */
export const useMatchSearch = () => {
    const searchMutation = useMutation({
        mutationFn: (request: MatchSearchRequest) => matchService.searchForMatches(request),
    });

    return {
        searchResults: searchMutation.data ?? [],
        searchLoading: searchMutation.isPending,
        searchError: searchMutation.error?.message ?? null,
        searchForMatches: searchMutation.mutateAsync,
    };
};