import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import userService from '@/src/api/services/user-service';
import {UserOnboardingRequest} from '@/src/types/user';
import {userKeys} from "@/src/hooks/useUser";

export const onboardingKeys = {
    all: ['onboarding'] as const,
    status: () => [...onboardingKeys.all, 'status'] as const,
};

export const useOnboarding = () => {
    const queryClient = useQueryClient();

    const onboardingStatusQuery = useQuery({
        queryKey: onboardingKeys.status(),
        queryFn: userService.getOnboardingStatus,
    });

    const completeOnboardingMutation = useMutation({
        mutationFn: (request: UserOnboardingRequest) => userService.completeOnboarding(request),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: onboardingKeys.all});
            queryClient.invalidateQueries({queryKey: userKeys.currentUser()}); //unavoidable coupling
        },
    });

    return {
        onboardingStatus: onboardingStatusQuery.data ?? null,
        onboardingStatusLoading: onboardingStatusQuery.isLoading,
        onboardingStatusError: onboardingStatusQuery.error?.message ?? null,

        completeOnboarding: completeOnboardingMutation.mutateAsync,
    }
}