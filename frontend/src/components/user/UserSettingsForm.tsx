import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button, Switch, List, Divider, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { UserResponse, UserGenderMatched } from '@/src/types/user';
import { UserSettingsUpdateRequest } from '@/src/types/ui/user';
import {spacing, theme} from '@/src/theme';

interface Props {
    initialData: UserResponse;
    onSubmit: (data: UserSettingsUpdateRequest) => Promise<void>;
    isLoading: boolean;
}

export const UserSettingsForm = ({ initialData, onSubmit, isLoading }: Props) => {
    const { control, handleSubmit, formState: { errors } } = useForm<UserSettingsUpdateRequest>({
        defaultValues: {
            email: initialData.email,
            genderMatched: initialData.genderMatched,
            showAge: initialData.showAge,
            showGenderDisplayed: initialData.showGenderDisplayed,
        }
    });

    return (
        <View style={styles.container}>
            {/* Account Section */}
            <List.Section
                title="Account Information"
                titleStyle={styles.title}
            >
                <Controller
                    control={control}
                    name="email"
                    rules={{
                        required: 'Email is required',
                        pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                    }}
                    render={({ field: { onChange, value, onBlur } }) => (
                        <View style={styles.inputGap}>
                            <TextInput
                                label="Email Address"
                                value={value ?? ''}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                error={!!errors.email}
                                disabled={isLoading}
                                mode="outlined"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                            {errors.email && <HelperText type="error">{errors.email.message}</HelperText>}
                        </View>
                    )}
                />
            </List.Section>

            <Divider />

            {/* Discovery Section */}
            <List.Section
                title="Matching Gender"
                titleStyle={styles.title}
            >
                <View style={styles.descriptionContainer}>
                    <Text variant="bodySmall" style={styles.description}>
                        This is used in searches so that others can match with you. It will not otherwise
                        be shown to other users. You can personalize your displayed gender on your profile.
                    </Text>
                </View>
                <Controller
                    control={control}
                    name="genderMatched"
                    rules={{required: 'Selection is required so that others can match with you'}}
                    render={({ field: { onChange, value } }) => (
                        <View>
                            <View style={styles.segmentedContainer}>
                                {Object.values(UserGenderMatched).map((gender) => (
                                    <Button
                                        key={gender}
                                        mode={value === gender ? 'contained' : 'outlined'}
                                        onPress={() => onChange(gender)}
                                        style={styles.flexButton}
                                        compact
                                        disabled={isLoading}
                                    >
                                        {gender}
                                    </Button>
                                ))}
                            </View>
                            {errors.genderMatched && (
                                <HelperText type="error">{errors.genderMatched.message}</HelperText>
                            )}
                        </View>
                    )}
                />
            </List.Section>

            <Divider />

            {/* Privacy Section */}
            <List.Section
                title="Privacy & Visibility"
                titleStyle={styles.title}
            >
                <Controller
                    control={control}
                    name="showAge"
                    render={({ field: { onChange, value } }) => (
                        <List.Item
                            title="Show Age"
                            description="Allow other users to see your age"
                            right={() => <Switch value={value ?? false} onValueChange={onChange} disabled={isLoading} />}
                        />
                    )}
                />
                <Controller
                    control={control}
                    name="showGenderDisplayed"
                    render={({ field: { onChange, value } }) => (
                        <List.Item
                            title="Show Custom Gender"
                            description="Display your custom gender description on your profile"
                            right={() => <Switch value={value ?? false} onValueChange={onChange} disabled={isLoading} />}
                        />
                    )}
                />
            </List.Section>

            <Button
                mode="contained"
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                disabled={isLoading}
                style={styles.submitButton}
            >
                Save Settings
            </Button>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {padding: spacing.lg},
    title: {fontSize: 16, color: theme.colors.primary},
    inputGap: {marginBottom: 10},
    descriptionContainer: {paddingHorizontal: spacing.md, paddingBottom: spacing.sm},
    description: {color: theme.colors.tertiaryDark, lineHeight: 20},
    segmentedContainer: {
        flexDirection: 'row',
        gap: spacing.sm,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.md
    },
    flexButton: {flex: 1},
    submitButton: {marginTop: 18},
});