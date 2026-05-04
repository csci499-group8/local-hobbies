import React from 'react';
import {View, StyleSheet} from 'react-native';
import {TextInput, Button, HelperText, Text} from 'react-native-paper';
import {useForm, Controller} from 'react-hook-form';

interface Props {
    initialValue?: string;
    onComplete: (publicContactInfo: string) => void;
    isSubmitting: boolean;
}

export const OnboardingContactStep = ({initialValue, onComplete, isSubmitting}: Props) => {
    const {control, handleSubmit, formState: {errors}} = useForm({
        defaultValues: {publicContactInfo: initialValue ?? ''},
    });

    return (
        <View style={styles.container}>
            <Text variant="bodyMedium" style={styles.description}>
                This is shown on your public profile so matched users can contact you.
                Use a social handle, email, or phone number.
            </Text>
            <Controller
                control={control}
                name="publicContactInfo"
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
                            error={!!errors.publicContactInfo}
                            returnKeyType="done"
                            onSubmitEditing={handleSubmit(v => onComplete(v.publicContactInfo))}
                        />
                        {errors.publicContactInfo && (
                            <HelperText type="error">{errors.publicContactInfo.message}</HelperText>
                        )}
                    </View>
                )}
            />
            <Button
                mode="contained"
                onPress={handleSubmit(v => onComplete(v.publicContactInfo))}
                disabled={isSubmitting}
                style={styles.button}
            >
                Continue
            </Button>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {gap: 16},
    description: {opacity: 0.6, lineHeight: 20},
    field: {gap: 4},
    button: {marginTop: 8},
});