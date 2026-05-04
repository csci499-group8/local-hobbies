import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Switch, List, Divider, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { UserResponse, UserGenderMatched } from '@/src/types/user';
import { UserSettingsUpdateRequest } from '@/src/types/ui/user';

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
            <List.Section title="Account Information">
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
            <List.Section title="Matching Preferences">
                <List.Subheader>
                    Please select the gender you want to go by for matching purposes. This will not
                    be shown to others. You can personalize your displayed gender on your profile.
                </List.Subheader>
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
            <List.Section title="Privacy & Visibility">
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
    container: { padding: 16 },
    inputGap: { marginBottom: 10 },
    sectionLabel: { paddingHorizontal: 8, marginBottom: 10, opacity: 0.6},
    segmentedContainer: {
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 8,
        marginBottom: 16
    },
    flexButton: { flex: 1 },
    submitButton: { marginTop: 18 }
});