import React, {useMemo, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {Button, Text, SegmentedButtons, HelperText} from 'react-native-paper';
import {useForm, Controller} from 'react-hook-form';
import {
    HobbyExperienceLevel,
    GlobalHobbyResponse,
    HobbyResponse,
    HobbyCreationRequest,
    HobbyUpdateRequest,
} from '@/src/types/hobby';
import {spacing, commonStyles} from '@/src/theme';
import {SearchablePickerModal} from '@/src/components/common/SearchablePickerModal';

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
    /** Hobby names already selected elsewhere — excluded from the picker. */
    excludeNames?: string[];
}

export const HobbyForm = ({hobby, globalHobbies, onSubmit, onDismiss, isSubmitting, excludeNames}: Props) => {
    const isEditing = !!hobby;
    const [hobbyPickerVisible, setHobbyPickerVisible] = useState(false);

    const {control, handleSubmit, watch, setValue, formState: {errors}} = useForm<FormValues>({
        defaultValues: {
            name: hobby?.name ?? '',
            experienceLevel: hobby?.experienceLevel ?? HobbyExperienceLevel.Beginner,
        },
    });

    const hobbyItems = useMemo(() =>
        globalHobbies
            .filter(h => !excludeNames?.includes(h.name))
            .map(h => ({
                label: `${h.name} (${h.category})`,
                value: h.name,
            })),
        [globalHobbies, excludeNames]
    );

    const nameValue = watch('name');
    const selectedHobbyLabel = nameValue
        ? hobbyItems.find(i => i.value === nameValue)?.label ?? nameValue
        : 'Select a hobby...';

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
                    render={() => (
                        <View style={styles.field}>
                            <Text variant="labelLarge">Select Hobby</Text>
                            <Button
                                mode="outlined"
                                icon="chevron-down"
                                onPress={() => setHobbyPickerVisible(true)}
                                disabled={isSubmitting}
                                contentStyle={styles.pickerButtonContent}
                            >
                                {selectedHobbyLabel}
                            </Button>
                            {errors.name && (
                                <HelperText type="error">{errors.name.message}</HelperText>
                            )}
                        </View>
                    )}
                />
            )}

            {/* Hobby search modal */}
            {!isEditing && (
                <SearchablePickerModal
                    visible={hobbyPickerVisible}
                    title="Select Hobby"
                    items={hobbyItems}
                    selectedValue={nameValue}
                    onSelect={(val) => setValue('name', val, {shouldValidate: true})}
                    onDismiss={() => setHobbyPickerVisible(false)}
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
    container: {gap: spacing.xl},
    title: commonStyles.sectionTitle,
    field: {gap: spacing.sm},
    pickerButtonContent: {flexDirection: 'row-reverse'},
    footer: commonStyles.footer,
    footerButton: commonStyles.footerButton,
});