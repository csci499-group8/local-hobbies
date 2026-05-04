import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Button, Text, SegmentedButtons, HelperText} from 'react-native-paper';
import {useForm, Controller} from 'react-hook-form';
import {Picker} from '@react-native-picker/picker';
import {
    HobbyExperienceLevel,
    GlobalHobbyResponse,
    HobbyResponse,
    HobbyCreationRequest,
    HobbyUpdateRequest,
} from '@/src/types/hobby';

type FormValues = {
    name: string;
    experienceLevel: HobbyExperienceLevel;
};

interface Props {
    hobby?: HobbyResponse; //defined = edit mode, undefined = create mode
    globalHobbies: GlobalHobbyResponse[];
    onSubmit: (request: HobbyCreationRequest | HobbyUpdateRequest) => Promise<void>;
    onDismiss: () => void;
    isSubmitting: boolean;
}

export const HobbyForm = ({hobby, globalHobbies, onSubmit, onDismiss, isSubmitting}: Props) => {
    const isEditing = !!hobby;

    const {control, handleSubmit, formState: {errors}} = useForm<FormValues>({
        defaultValues: {
            name: hobby?.name ?? '',
            experienceLevel: hobby?.experienceLevel ?? HobbyExperienceLevel.Beginner,
        },
    });

    const handleFormSubmit = (values: FormValues) => {
        if (isEditing) {
            onSubmit({experienceLevel: values.experienceLevel} as HobbyUpdateRequest);
        } else {
            onSubmit({name: values.name, experienceLevel: values.experienceLevel} as HobbyCreationRequest);
        }
    };

    return (
        <View style={styles.container}>
            <Text variant="titleLarge" style={styles.title}>
                {isEditing ? `Edit ${hobby.name}` : 'Add New Hobby'}
            </Text>

            {/* Name picker — create mode only; name cannot be changed after creation */}
            {!isEditing && (
                <Controller
                    control={control}
                    name="name"
                    rules={{required: 'Please select a hobby'}}
                    render={({field: {onChange, value}}) => (
                        <View style={styles.field}>
                            <Text variant="labelLarge">Select Hobby</Text>
                            <View style={styles.pickerBorder}>
                                <Picker selectedValue={value} onValueChange={onChange}>
                                    <Picker.Item label="Select a hobby..." value="" />
                                    {globalHobbies.map(h => (
                                        <Picker.Item
                                            key={h.name}
                                            label={`${h.name} (${h.category})`}
                                            value={h.name}
                                        />
                                    ))}
                                </Picker>
                            </View>
                            {errors.name && (
                                <HelperText type="error">{errors.name.message}</HelperText>
                            )}
                        </View>
                    )}
                />
            )}

            {/* Experience level — available in both create and edit mode
                No rules required since experienceLevel has a default value and cannot be deselected */}
            <Controller
                control={control}
                name="experienceLevel"
                render={({field: {onChange, value}}) => (
                    <View style={styles.field}>
                        <Text variant="labelLarge">Experience Level</Text>
                        <SegmentedButtons
                            value={value}
                            onValueChange={onChange}
                            buttons={[
                                {value: HobbyExperienceLevel.Beginner, label: 'Beginner'},
                                {value: HobbyExperienceLevel.Intermediate, label: 'Int.'},
                                {value: HobbyExperienceLevel.Advanced, label: 'Adv.'},
                            ]}
                        />
                    </View>
                )}
            />

            <View style={styles.footer}>
                <Button
                    mode="outlined"
                    onPress={onDismiss}
                    disabled={isSubmitting}
                    style={styles.footerButton}
                >
                    Cancel
                </Button>
                <Button
                    mode="contained"
                    onPress={handleSubmit(handleFormSubmit)}
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    style={styles.footerButton}
                >
                    {isEditing ? 'Update' : 'Add'}
                </Button>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {gap: 20},
    title: {fontWeight: 'bold'},
    field: {gap: 8},
    pickerBorder: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        overflow: 'hidden',
    },
    footer: {flexDirection: 'row', gap: 12, marginTop: 10},
    footerButton: {flex: 1},
});