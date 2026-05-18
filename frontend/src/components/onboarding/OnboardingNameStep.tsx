import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text, TextInput, Button, HelperText} from 'react-native-paper';
import {useForm, Controller} from 'react-hook-form';
import {spacing, commonStyles} from '@/src/theme';

interface Props {
    initialValue?: string;
    onComplete: (name: string) => void;
    isSubmitting: boolean;
}

export const OnboardingNameStep = ({initialValue, onComplete, isSubmitting}: Props) => {
    const {control, handleSubmit, formState: {errors}} = useForm({
        defaultValues: {name: initialValue ?? ''},
    });

    return (
        <View style={styles.container}>
            <Controller
                control={control}
                name="name"
                rules={{required: 'Name is required'}}
                render={({field: {onChange, onBlur, value}}) => (
                    <View style={styles.field}>
                        <TextInput
                            label="Display Name"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            mode="outlined"
                            disabled={isSubmitting}
                            error={!!errors.name}
                            returnKeyType="done"
                            onSubmitEditing={handleSubmit(v => onComplete(v.name))}
                        />
                        {errors.name && (
                            <HelperText type="error">{errors.name.message}</HelperText>
                        )}
                    </View>
                )}
            />
            <Button
                mode="contained"
                onPress={handleSubmit(v => onComplete(v.name))}
                disabled={isSubmitting}
                style={styles.button}
            >
                Continue
            </Button>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {gap: spacing.xxl},
    field: {gap: spacing.xs},
    button: {marginTop: spacing.sm},
});