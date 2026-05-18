import {Alert} from "react-native";
import {useMatch} from "@/src/hooks/useMatch";
import {useState} from "react";

export const useSavedMatchActions = () => {
    const {createSavedMatch, updateSavedMatch, deleteSavedMatch} = useMatch();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreate = async (
        savedUserId: string,
        notes: string | null,
        onSuccess?: () => void
    ) => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            await createSavedMatch({savedUserId, notes});
            onSuccess?.();
        } catch (e: unknown) {
            Alert.alert('Error', e instanceof Error ? e.message : 'An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateNotes = async (
        matchId: string,
        notes: string | null,
        onSuccess?: () => void
    ) => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            await updateSavedMatch({matchId, request: {notes}});
            onSuccess?.();
        } catch (e: unknown) {
            Alert.alert('Error', e instanceof Error ? e.message : 'An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (matchId: string, userName: string, onSuccess?: () => void) => {
        Alert.alert(
            'Remove Match',
            `Are you sure you want to remove ${userName}?`,
            [
                {text: 'Cancel', style: 'cancel'},
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteSavedMatch(matchId);
                            onSuccess?.();
                        } catch (e: unknown) {
                            Alert.alert('Error', e instanceof Error ? e.message : 'An unexpected error occurred');
                        }
                    },
                },
            ]
        );
    };

    return {isSubmitting, handleCreate, handleUpdateNotes, handleDelete};
};