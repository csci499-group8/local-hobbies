import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Text, TextInput, Button, Avatar, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DateTime } from 'luxon';
import { UserResponse } from '@/src/types/user';
import { UserProfileUpdateRequest } from '@/src/types/ui/user';
import {useLocationField} from '@/src/hooks/useLocationField';
import {LocationPickerModal} from '@/src/components/location/LocationPickerModal';
import {GeoJsonPoint} from "@/src/types/common";
import {DATE_PICKER_DISPLAY} from "@/src/utils/date-helpers";
import {spacing, theme} from '@/src/theme';

interface Props {
    initialData: UserResponse;
    onSubmit: (data: UserProfileUpdateRequest) => Promise<void>;
    /** True while the initial user data is being fetched — disables the form. */
    isLoading: boolean;
    /** True while the form submission (upload + save) is in progress — disables the form. */
    isSubmitting: boolean;
}

export const UserProfileForm = ({ initialData, onSubmit, isLoading, isSubmitting }: Props) => {
    const isDisabled = isLoading || isSubmitting;
    const [showDatePicker, setShowDatePicker] = useState(false);
    // Kept in plain React state — not RHF — because setValue on an unregistered
    // field is unreliable: handleSubmit may not forward it, so updates.photo
    // arrives as undefined and the upload is silently skipped.
    // null = user has not picked a new photo this session (keep existing).
    const [photoAsset, setPhotoAsset] = useState<{uri: string; name: string; type: string} | null>(null);
    // Initial location is existing approximate location
    const locationField = useLocationField(
        initialData.locationPoint,
        initialData.locationApproximate
    );

    const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<UserProfileUpdateRequest>({
        defaultValues: {
            name: initialData.name,
            birthDate: initialData.birthDate,
            bio: initialData.bio,
            genderDisplayed: initialData.genderDisplayed,
            contactInfo: initialData.contactInfo,
            location: initialData.locationPoint
        }
    });

    const birthDateValue = watch('birthDate');
    const formattedBirthDate = birthDateValue
        ? DateTime.fromISO(birthDateValue).toLocaleString(DateTime.DATE_MED)
        : 'Select date of birth';

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            const asset = result.assets[0];
            setPhotoAsset({
                uri: asset.uri,
                name: asset.fileName ?? 'profile.jpg',
                type: asset.mimeType ?? 'image/jpeg',
            });
        }
    };

    // Called by RHF after validation passes. Merges the locally-tracked photo
    // into the validated form values before handing off to the parent.
    // photo: photoAsset ?? undefined means:
    //   - new photo picked  → photoAsset set → upload runs in useUser.ts
    //   - no new photo      → photoAsset null → photo undefined → upload skipped,
    //                         backend keeps the existing profile photo unchanged
    const handleFormSubmit = (values: UserProfileUpdateRequest) => {
        onSubmit({
            ...values,
            photo: photoAsset ?? undefined,
        });
    };

    const handleLocationConfirm = (loc: GeoJsonPoint, addr: string) => {
        locationField.handleConfirm(loc, addr);
        // Mark form as "modified"
        setValue('location', loc, { shouldDirty: true });
    };

    return (
        <View style={styles.container}>
            <View style={styles.photoSection}>
                {photoAsset?.uri || initialData.profilePhotoUrl ? (
                    <Image
                        source={{ uri: photoAsset?.uri ?? initialData.profilePhotoUrl ?? undefined }}
                        style={styles.imageCircle}
                        contentFit="cover"
                    />
                ) : (
                    <Avatar.Icon size={100} icon="account" />
                )}
                <Button onPress={pickImage} disabled={isDisabled}>
                    Change Photo
                </Button>
            </View>

            <Controller
                control={control}
                name="name"
                rules={{ required: 'Name is required' }}
                render={({ field: { onChange, value, onBlur } }) => (
                    <View style={styles.inputGap}>
                        <TextInput
                            label="Display Name"
                            value={value}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            error={!!errors.name}
                            disabled={isDisabled}
                            mode="outlined"
                        />
                        {errors.name && <HelperText type="error">{errors.name.message}</HelperText>}
                    </View>
                )}
            />

            <View style={styles.inputGap}>
                <TextInput
                    label="Birth Date"
                    value={formattedBirthDate}
                    onPressIn={() => setShowDatePicker(true)}
                    showSoftInputOnFocus={false}
                    mode="outlined"
                    disabled={isDisabled}
                    right={<TextInput.Icon
                        icon="calendar"
                        onPress={() => setShowDatePicker(true)}
                        color={theme.colors.primary}
                    />}
                />
                {showDatePicker && (
                    <DateTimePicker
                        value={DateTime.fromISO(birthDateValue ?? '').toJSDate()}
                        mode="date"
                        display={DATE_PICKER_DISPLAY}
                        maximumDate={new Date()}
                        onChange={(_event, selectedDate) => {
                            setShowDatePicker(Platform.OS === 'ios');
                            if (selectedDate) {
                                setValue('birthDate', DateTime.fromJSDate(selectedDate).toISODate()!);
                            }
                        }}
                    />
                )}
            </View>

            <Controller
                control={control}
                name="bio"
                render={({ field: { onChange, value, onBlur } }) => (
                    <TextInput
                        label="Bio (Optional)"
                        value={value ?? ''}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        multiline
                        numberOfLines={4}
                        mode="outlined"
                        disabled={isDisabled}
                        style={styles.inputGap}
                    />
                )}
            />

            <Controller
                control={control}
                name="genderDisplayed"
                render={({ field: { onChange, value, onBlur } }) => (
                    <TextInput
                        label="Gender Displayed (Optional)"
                        value={value ?? ''}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        mode="outlined"
                        disabled={isDisabled}
                        style={styles.inputGap}
                    />
                )}
            />

            <View style={styles.inputGap}>
                <Button
                    mode="outlined"
                    icon="map-marker"
                    onPress={locationField.openPicker}
                    disabled={isDisabled}
                >
                    {locationField.address ?? 'Set Your Primary Location'}
                </Button>
                <HelperText
                    type={!locationField.address ? "error" : "info"}
                    visible={true}
                    style={styles.hint}
                >
                    {!locationField.address
                        ? "Location is required so other hobbyists can find you."
                        : "Your exact location is never shown to other users."
                    }
                </HelperText>
            </View>

            <View>
                <Controller
                    control={control}
                    name="contactInfo"
                    rules={{ required: 'Contact information is required' }}
                    render={({ field: { onChange, value, onBlur } }) => (
                        <View>
                            <TextInput
                                label="Contact Info (e.g. Instagram, WhatsApp)"
                                value={value}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                error={!!errors.contactInfo}
                                disabled={isDisabled}
                                mode="outlined"
                            />
                            {errors.contactInfo && (
                                <HelperText type="error">{errors.contactInfo.message}</HelperText>
                            )}
                        </View>
                    )}
                />
                <HelperText
                    type={"info"}
                    visible={true}
                    style={styles.hint}
                >
                    This is shown only to users who have mutually matched with you so that they can contact you.
                    It will appear on your profile and on other users' Mutual Matches page.
                </HelperText>
            </View>

            <Button
                mode="contained"
                onPress={handleSubmit(handleFormSubmit)}
                loading={isSubmitting}
                disabled={isDisabled}
                style={styles.submitButton}
            >
                Save Changes
            </Button>

            <LocationPickerModal
                visible={locationField.showPicker}
                //Watch so that if user opens modal twice, the map does not reset
                initialLocation={watch('location')}
                onConfirm={handleLocationConfirm}
                onDismiss={locationField.closePicker}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {padding: spacing.lg},
    photoSection: {alignItems: 'center', marginBottom: spacing.xxl, gap: spacing.sm},
    imageCircle: {width: 100, height: 100, borderRadius: 50},
    inputGap: {marginBottom: 10},
    hint: {color: theme.colors.tertiaryDark},
    description: {color: theme.colors.tertiaryDark, lineHeight: 20},
    submitButton: {marginTop: 18},
});