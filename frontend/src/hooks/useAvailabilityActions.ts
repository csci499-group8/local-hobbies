// Wraps availability mutations with error handling and loading state.
// Used by availabilities.tsx to keep the screen thin.

import {useState} from 'react';
import {Alert} from 'react-native';
import {useAvailability} from './useAvailability';
import {
    OneTimeAvailabilityCreationRequest,
    OneTimeAvailabilityUpdateRequest,
    RecurringAvailabilityCreationRequest,
    RecurringAvailabilityUpdateRequest,
    AvailabilityExceptionCreationRequest,
    AvailabilityExceptionUpdateRequest,
} from '@/src/types/availability';

export const useAvailabilityActions = () => {
    const {
        addOneTimeAvailability,
        updateOneTimeAvailability,
        deleteOneTimeAvailability,
        addRecurringAvailability,
        updateRecurringAvailability,
        deleteRecurringAvailability,
        addAvailabilityException,
        updateAvailabilityException,
        deleteAvailabilityException,
    } = useAvailability();

    const [isSubmitting, setIsSubmitting] = useState(false);

    const wrap = async (fn: () => Promise<unknown>, onSuccess?: () => void) => {
        setIsSubmitting(true);
        try {
            await fn();
            onSuccess?.();
        } catch (e: unknown) {
            Alert.alert('Error', e instanceof Error ? e.message : 'An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDelete = (label: string, onConfirm: () => Promise<void>) => {
        Alert.alert(
            'Remove Availability',
            `Are you sure you want to remove this ${label}?`,
            [
                {text: 'Cancel', style: 'cancel'},
                {text: 'Remove', style: 'destructive', onPress: () => wrap(onConfirm)},
            ]
        );
    };

    return {
        isSubmitting,

        handleAddOneTime: (req: OneTimeAvailabilityCreationRequest, onSuccess?: () => void) =>
            wrap(() => addOneTimeAvailability(req), onSuccess),

        handleUpdateOneTime: (id: string, req: OneTimeAvailabilityUpdateRequest, onSuccess?: () => void) =>
            wrap(() => updateOneTimeAvailability({oneTimeId: id, request: req}), onSuccess),

        handleDeleteOneTime: (id: string) =>
            confirmDelete('one-time availability', () => deleteOneTimeAvailability(id)),

        handleAddRecurring: (req: RecurringAvailabilityCreationRequest, onSuccess?: () => void) =>
            wrap(() => addRecurringAvailability(req), onSuccess),

        handleUpdateRecurring: (id: string, req: RecurringAvailabilityUpdateRequest, onSuccess?: () => void) =>
            wrap(() => updateRecurringAvailability({recurringId: id, request: req}), onSuccess),

        handleDeleteRecurring: (id: string) =>
            confirmDelete('recurring availability', () => deleteRecurringAvailability(id)),

        handleAddException: (req: AvailabilityExceptionCreationRequest, onSuccess?: () => void) =>
            wrap(() => addAvailabilityException(req), onSuccess),

        handleUpdateException: (id: string, req: AvailabilityExceptionUpdateRequest, onSuccess?: () => void) =>
            wrap(() => updateAvailabilityException({exceptionId: id, request: req}), onSuccess),

        handleDeleteException: (id: string) =>
            confirmDelete('availability exception', () => deleteAvailabilityException(id)),
    };
};