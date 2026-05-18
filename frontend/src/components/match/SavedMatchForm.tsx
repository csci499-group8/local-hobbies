// Handles both creating a saved match (from match-search.tsx; requires
// savedUserId) and editing notes on an existing match (from saved-matches.tsx
// or mutual-matches.tsx; requires matchId).

import React from 'react';
import {View, StyleSheet, KeyboardAvoidingView, Platform} from 'react-native';
import {Button, Text, TextInput, HelperText} from 'react-native-paper';
import {useForm, Controller} from 'react-hook-form';
import {spacing, commonStyles} from '@/src/theme';

type FormValues = {
    notes: string;
};

type Props =
    | {
        mode: 'create';
        userName: string;
        onSubmit: (notes: string | null) => Promise<void>;
        onDismiss: () => void;
        isSubmitting: boolean;
      }
    | {
        mode: 'edit';
        userName: string;
        initialNotes: string | null;
        onSubmit: (notes: string | null) => Promise<void>;
        onDismiss: () => void;
        isSubmitting: boolean;
      };

export const SavedMatchForm = (props: Props) => {
    const {control, handleSubmit, formState: {errors}} = useForm<FormValues>({
        defaultValues: {
            notes: props.mode === 'edit' ? (props.initialNotes ?? '') : '',
        },
    });

    const handleFormSubmit = (values: FormValues) => {
        props.onSubmit(values.notes.trim() || null);
    };

    return (
        // KeyboardAvoidingView prevents the keyboard from obscuring the
        // submit button when the form is rendered inside a modal
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.container}>
                <Text variant="titleLarge" style={styles.title}>
                    {props.mode === 'create'
                        ? `Save ${props.userName}`
                        : `Edit notes for ${props.userName}`}
                </Text>

                {props.mode === 'create' && (
                    <Text variant="bodyMedium" style={styles.subtitle}>
                        You can add a private note to help you remember this person.
                    </Text>
                )}

                <Controller
                    control={control}
                    name="notes"
                    render={({field: {onChange, value}}) => (
                        <View style={styles.field}>
                            <TextInput
                                label="Notes (optional)"
                                value={value}
                                onChangeText={onChange}
                                mode="outlined"
                                multiline
                                numberOfLines={3}
                                disabled={props.isSubmitting}
                                style={commonStyles.lightBackground}
                                maxLength={NOTES_MAX_LENGTH}
                                right={
                                    <TextInput.Affix
                                        text={`${value.length}/${NOTES_MAX_LENGTH}`}
                                    />
                                }
                            />
                            {errors.notes && (
                                <HelperText type="error">{errors.notes.message}</HelperText>
                            )}
                        </View>
                    )}
                />

                <View style={styles.footer}>
                    <Button
                        mode="outlined"
                        onPress={props.onDismiss}
                        disabled={props.isSubmitting}
                        style={styles.footerButton}
                    >
                        Cancel
                    </Button>
                    <Button
                        mode="contained"
                        onPress={handleSubmit(handleFormSubmit)}
                        loading={props.isSubmitting}
                        disabled={props.isSubmitting}
                        style={styles.footerButton}
                    >
                        {props.mode === 'create' ? 'Save Match' : 'Update Notes'}
                    </Button>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

const NOTES_MAX_LENGTH = 500;

const styles = StyleSheet.create({
    container: {gap: spacing.lg},
    title: commonStyles.sectionTitle,
    subtitle: commonStyles.fieldLabel,
    field: {gap: spacing.xs},
    footer: commonStyles.footer,
    footerButton: commonStyles.footerButton,
});