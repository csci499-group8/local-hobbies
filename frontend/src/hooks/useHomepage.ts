import {useQuery} from '@tanstack/react-query';
import userService from '@/src/api/services/user-service';

export const homepageKeys = {
    all: ['homepage'] as const,
    homepage: () => [...homepageKeys.all, 'homepage'] as const,
};

export const useHomepage = () => {
    const homepageQuery = useQuery({
        queryKey: homepageKeys.homepage(),
        queryFn: userService.getHomepage,
    });

    return {
        homepageData: homepageQuery.data ?? null,
        homepageLoading: homepageQuery.isLoading,
        homepageError: homepageQuery.error?.message ?? null,
    };
};