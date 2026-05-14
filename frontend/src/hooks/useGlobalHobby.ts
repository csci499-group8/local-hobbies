import {useQuery} from '@tanstack/react-query';
import hobbyService from '@/src/api/services/hobby-service';

export const globalHobbyKeys = {
    all: ['globalHobbies'] as const,
};

export const useGlobalHobby = () => {
    const query = useQuery({
        queryKey: globalHobbyKeys.all,
        queryFn: hobbyService.getGlobalHobbies,
    });

    return {
        globalHobbies: query.data ?? [],
        globalHobbiesLoading: query.isLoading,
        globalHobbiesError: query.error?.message ?? null,
    };
};