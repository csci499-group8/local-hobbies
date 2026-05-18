import React from 'react';
import {View, StyleSheet} from 'react-native';
import {TextInput, Button, HelperText, Text} from 'react-native-paper';
import {useForm, Controller} from 'react-hook-form';
import {spacing, commonStyles} from '@/src/theme';

interface Props {
    initialValue?: string;
    onComplete: (contactInfo: string) => void;
    isSubmitting: boolean;
}

export const OnboardingContactStep = ({initialValue, onComplete, isSubmitting}: Props) => {
    const {control, handleSubmit, formState: {errors}} = useForm({
        defaultValues: {contactInfo: initialValue ?? ''},
    });

    return (
        <View style={styles.container}>
            <Text variant="bodyMedium" style={styles.description}>
                This is shown only to users who have mutually matched wih you so that they can contact you.
                Use a social handle, email, or phone number.
            </Text>
            <Controller
                control={control}
                name="contactInfo"
                rules={{required: 'Contact information is required'}}
                render={({field: {onChange, onBlur, value}}) => (
                    <View style={styles.field}>
                        <TextInput
                            label="e.g. @yourhandle, your@email.com"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            mode="outlined"
                            disabled={isSubmitting}
                            error={!!errors.contactInfo}
                            returnKeyType="done"
                            onSubmitEditing={handleSubmit(v => onComplete(v.contactInfo))}
                        />
                        {errors.contactInfo && (
                            <HelperText type="error">{errors.contactInfo.message}</HelperText>
                        )}
                    </View>
                )}
            />
            <Button
                mode="contained"
                onPress={handleSubmit(v => onComplete(v.contactInfo))}
                disabled={isSubmitting}
                style={styles.button}
            >
                Continue
            </Button>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {gap: spacing.lg},
    description: commonStyles.fieldLabel,
    field: {gap: spacing.xs},
    button: {marginTop: spacing.sm},
});