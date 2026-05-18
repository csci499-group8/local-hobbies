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

    const sorted = (query.data ?? []).slice().sort((a, b) => {
        const catCmp = a.category.localeCompare(b.category);
        return catCmp !== 0 ? catCmp : a.name.localeCompare(b.name);
    });

    return {
        globalHobbies: sorted,
        globalHobbiesLoading: query.isLoading,
        globalHobbiesError: query.error?.message ?? null,
    };
};