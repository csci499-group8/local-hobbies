import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import hobbyService from '@/src/api/services/hobby-service';
import {
    HobbyCreationRequest,
    HobbyUpdateRequest,
    HobbyResponse,
    HobbyPhotoUpdateRequest,
    HobbyPhotoResponse
} from '@/src/types/hobby';
import {performTwoStepUpload} from '@/src/api/services/upload-service';

export const hobbyKeys = {
    all: ['hobby'] as const,
    hobbies: () => [...hobbyKeys.all, 'hobbies'] as const,
    photos: () => [...hobbyKeys.all, 'photos'] as const,
    photosByHobby: (hobbyId: string) => [...hobbyKeys.photos(), hobbyId] as const,
};

export const useHobby = () => {
    const queryClient = useQueryClient();

    //read queries

    const hobbiesQuery = useQuery({
        queryKey: hobbyKeys.hobbies(),
        queryFn: hobbyService.getHobbies,
    });

    const hobbyPhotosQuery = useQuery({
        queryKey: hobbyKeys.photos(),
        queryFn: hobbyService.getHobbyPhotos,
    });

    //write mutations

    const addHobbyMutation = useMutation({
        mutationFn: (request: HobbyCreationRequest) => hobbyService.addHobby(request),
        onSuccess: (newHobby) => {
            queryClient.setQueryData(hobbyKeys.hobbies(), (prev: HobbyResponse[] | undefined) =>
                [...(prev ?? []), newHobby]
            );
        },
    });

    const updateHobbyMutation = useMutation({
        mutationFn: ({hobbyId, request}: {hobbyId: string; request: HobbyUpdateRequest}) =>
            hobbyService.updateHobby(hobbyId, request),
        onSuccess: (updatedHobby) => {
            queryClient.setQueryData(hobbyKeys.hobbies(), (prev: HobbyResponse[] | undefined) =>
                (prev ?? []).map(h => h.id === updatedHobby.id ? updatedHobby : h)
            );
        },
    });

    const deleteHobbyMutation = useMutation({
        mutationFn: (hobbyId: string) => hobbyService.deleteHobby(hobbyId),
        onSuccess: (_, hobbyId) => {
            queryClient.setQueryData(hobbyKeys.hobbies(), (prev: HobbyResponse[] | undefined) =>
                (prev ?? []).filter(h => h.id !== hobbyId)
            );
        },
    });

    const addHobbyPhotoMutation = useMutation({
        mutationFn: async ({hobbyId, photo, caption}: {
            hobbyId: string;
            photo: {uri: string; name: string; type: string};
            caption?: string | null;
        }) => {
            const photoKey = await performTwoStepUpload(
                photo.uri,
                photo.name,
                photo.type,
                (name, type) => hobbyService.getHobbyPhotoUploadUrl(hobbyId, {fileName: name, contentType: type})
            );
            return hobbyService.addHobbyPhoto(hobbyId, {photoKey, caption});
        },
        onSuccess: (newPhoto) => {
            queryClient.setQueryData(hobbyKeys.photos(), (prev: HobbyPhotoResponse[] | undefined) =>
                [...(prev ?? []), newPhoto]
            );
            queryClient.setQueryData(hobbyKeys.photosByHobby(newPhoto.hobbyId), (prev: HobbyPhotoResponse[] | undefined) =>
                [...(prev ?? []), newPhoto]
            );
        },
    });

    const updateHobbyPhotoMutation = useMutation({
        mutationFn: ({photoId, request}: {photoId: string; request: HobbyPhotoUpdateRequest}) =>
            hobbyService.updateHobbyPhoto(photoId, request),
        onSuccess: (updatedPhoto) => {
            queryClient.setQueryData(hobbyKeys.photos(), (prev: HobbyPhotoResponse[] | undefined) =>
                (prev ?? []).map(p => p.id === updatedPhoto.id ? updatedPhoto : p)
            );
            queryClient.setQueryData(hobbyKeys.photosByHobby(updatedPhoto.hobbyId), (prev: HobbyPhotoResponse[] | undefined) =>
                (prev ?? []).map(p => p.id === updatedPhoto.id ? updatedPhoto : p)
            );
        },
    });

    const deleteHobbyPhotoMutation = useMutation({
        mutationFn: ({photoId}: {photoId: string; hobbyId: string}) => //mutation only needs photoId, but photosByHobby needs hobbyId
            hobbyService.deleteHobbyPhoto(photoId),
        onSuccess: (_, {photoId, hobbyId}) => {
            queryClient.setQueryData(hobbyKeys.photos(), (prev: HobbyPhotoResponse[] | undefined) =>
                (prev ?? []).filter(p => p.id !== photoId)
            );
            queryClient.setQueryData(hobbyKeys.photosByHobby(hobbyId), (prev: HobbyPhotoResponse[] | undefined) =>
                (prev ?? []).filter(p => p.id !== photoId)
            );
        },
    });

    return {
        //user's hobbies
        hobbies: hobbiesQuery.data ?? [],
        hobbiesLoading: hobbiesQuery.isLoading,
        hobbiesError: hobbiesQuery.error?.message ?? null,

        //hobby photos
        hobbyPhotos: hobbyPhotosQuery.data ?? [],
        hobbyPhotosLoading: hobbyPhotosQuery.isLoading,
        hobbyPhotosSyncing: hobbyPhotosQuery.isFetching || addHobbyPhotoMutation.isPending || deleteHobbyPhotoMutation.isPending,
        hobbyPhotosError: hobbyPhotosQuery.error?.message ?? null,

        //write operations
        addHobby: addHobbyMutation.mutateAsync,
        updateHobby: updateHobbyMutation.mutateAsync,
        deleteHobby: deleteHobbyMutation.mutateAsync,
        addHobbyPhoto: addHobbyPhotoMutation.mutateAsync,
        updateHobbyPhoto: updateHobbyPhotoMutation.mutateAsync,
        deleteHobbyPhoto: deleteHobbyPhotoMutation.mutateAsync,
    };
};

/**
 * Separate hook for fetching photos by hobby ID, because parameterized queries
 * require their own hook instance per hobbyId
 */
export const useHobbyPhotosByHobby = (hobbyId: string) => {
    const query = useQuery({
        queryKey: hobbyKeys.photosByHobby(hobbyId),
        queryFn: () => hobbyService.getHobbyPhotosByHobbyId(hobbyId),
        enabled: !!hobbyId,
    });

    return {
        hobbyPhotos: query.data ?? [],
        hobbyPhotosLoading: query.isLoading,
        hobbyPhotosSyncing: query.isFetching,
        hobbyPhotosError: query.error?.message ?? null,
    };
};