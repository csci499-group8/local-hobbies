import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import userService from '@/src/api/services/user-service';
import {
    UserOnboardingRequest,
    UserUpdateRequest,
} from '@/src/types/user';
import {performTwoStepUpload} from '@/src/api/services/upload-service';
import {UserProfileUpdateRequest, UserSettingsUpdateRequest} from '@/src/types/ui/user';

export const userKeys = {
    all: ['user'] as const,
    currentUser: () => [...userKeys.all, 'current'] as const,
    onboardingStatus: () => [...userKeys.all, 'onboarding'] as const,
    currentUserProfile: () => [...userKeys.all, 'profile'] as const,
    otherUserProfile: (userId: string) => [...userKeys.all, 'profile', userId] as const,
};

export const useUser = () => {
    const queryClient = useQueryClient();

    //read queries

    const currentUserQuery = useQuery({
        queryKey: userKeys.currentUser(),
        queryFn: userService.getCurrentUser,
    });

    const onboardingStatusQuery = useQuery({
        queryKey: userKeys.onboardingStatus(),
        queryFn: userService.getOnboardingStatus,
    });

    const currentUserProfileQuery = useQuery({
        queryKey: userKeys.currentUserProfile(),
        queryFn: userService.getCurrentUserProfile,
    });

    //write mutations

    const completeOnboardingMutation = useMutation({
        mutationFn: (request: UserOnboardingRequest) => userService.completeOnboarding(request),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: userKeys.onboardingStatus()});
            queryClient.invalidateQueries({queryKey: userKeys.currentUser()});
        },
    });

    const updateUserProfileMutation = useMutation({
        mutationFn: async (updates: UserProfileUpdateRequest) => {
            const apiDto: UserUpdateRequest = {
                name: updates.name,
                birthDate: updates.birthDate,
                genderDisplayed: updates.genderDisplayed,
                bio: updates.bio,
                location: updates.location,
                publicContactInfo: updates.publicContactInfo,
            };

            if (updates.photo) {
                apiDto.profilePhotoKey = await performTwoStepUpload(
                    updates.photo.uri,
                    updates.photo.name,
                    updates.photo.type,
                    (name, type) => userService.getProfilePhotoUploadUrl({fileName: name, contentType: type})
                );
            }

            return userService.updateCurrentUser(apiDto);
        },
        onSuccess: (updatedUser) => {
            queryClient.setQueryData(userKeys.currentUser(), updatedUser);

            //profile contains non-user state, so better to invalidate
            queryClient.invalidateQueries({queryKey: userKeys.currentUserProfile()});
        },
    });

    const updateUserSettingsMutation = useMutation({
        mutationFn: (updates: UserSettingsUpdateRequest) => {
            const apiDto: UserUpdateRequest = {
                email: updates.email,
                genderMatched: updates.genderMatched,
                showAge: updates.showAge,
                showGenderDisplayed: updates.showGenderDisplayed,
            };
            return userService.updateCurrentUser(apiDto);
        },
        onSuccess: (updatedUser) => {
            queryClient.setQueryData(userKeys.currentUser(), updatedUser);

            //profile contains non-user state, so better to invalidate
            queryClient.invalidateQueries({queryKey: userKeys.currentUserProfile()});
        },
    });

    const deleteAccountMutation = useMutation({
        mutationFn: userService.deleteCurrentUser,
        onSuccess: () => queryClient.clear(),
    });

    return {
        //current user
        user: currentUserQuery.data ?? null,
        userLoading: currentUserQuery.isLoading,
        userError: currentUserQuery.error?.message ?? null,

        //onboarding status
        onboardingStatus: onboardingStatusQuery.data ?? null,
        onboardingStatusLoading: onboardingStatusQuery.isLoading,
        onboardingStatusError: onboardingStatusQuery.error?.message ?? null,

        //current user profile
        currentUserProfile: currentUserProfileQuery.data ?? null,
        currentUserProfileLoading: currentUserProfileQuery.isLoading,
        currentUserProfileError: currentUserProfileQuery.error?.message ?? null,

        //write operations
        completeOnboarding: completeOnboardingMutation.mutateAsync,
        updateUserProfile: updateUserProfileMutation.mutateAsync,
        updateUserSettings: updateUserSettingsMutation.mutateAsync,
        deleteAccount: deleteAccountMutation.mutateAsync,
    };
};

/**
 * Separate hook for fetching another user's profile, because parameterized queries
 * require their own hook instance per userId
 */
export const useOtherUserProfile = (userId: string) => {
    const query = useQuery({
        queryKey: userKeys.otherUserProfile(userId),
        queryFn: () => userService.getOtherUserProfile(userId),
        enabled: !!userId,
    });

    return {
        otherUserProfile: query.data ?? null,
        otherUserProfileLoading: query.isLoading,
        otherUserProfileError: query.error?.message ?? null,
    };
};