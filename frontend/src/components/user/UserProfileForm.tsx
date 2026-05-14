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
    isLoading: boolean;
}

export const UserProfileForm = ({ initialData, onSubmit, isLoading }: Props) => {
    const [showDatePicker, setShowDatePicker] = useState(false);
    // Track local photo URI for immediate preview
    const [localPhotoUri, setLocalPhotoUri] = useState<string | null>(null);
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
            publicContactInfo: initialData.publicContactInfo,
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
            setLocalPhotoUri(asset.uri);
            setValue('photo', {
                uri: asset.uri,
                name: asset.fileName ?? 'profile.jpg',
                type: asset.mimeType ?? 'image/jpeg',
            });
        }
    };

    const handleLocationConfirm = (loc: GeoJsonPoint, addr: string) => {
        locationField.handleConfirm(loc, addr);
        // Mark form as "modified"
        setValue('location', loc, { shouldDirty: true });
    };

    return (
        <View style={styles.container}>
            <View style={styles.photoSection}>
                {localPhotoUri || initialData.profilePhotoUrl ? (
                    <Image
                        source={{ uri: localPhotoUri ?? initialData.profilePhotoUrl ?? undefined }}
                        style={styles.imageCircle}
                        contentFit="cover"
                    />
                ) : (
                    <Avatar.Icon size={100} icon="account" />
                )}
                <Button onPress={pickImage} disabled={isLoading}>
                    <Text>Change Photo</Text>
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
                            disabled={isLoading}
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
                    disabled={isLoading}
                    right={<TextInput.Icon icon="calendar" onPress={() => setShowDatePicker(true)} />}
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
                        disabled={isLoading}
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
                        disabled={isLoading}
                        style={styles.inputGap}
                    />
                )}
            />

            <View style={styles.inputGap}>
                <Button
                    mode="outlined"
                    icon="map-marker"
                    onPress={locationField.openPicker}
                    disabled={isLoading}
                >
                    {locationField.address ?? 'Set Your Primary Location'}
                </Button>
                <HelperText
                    type={!locationField.address ? "error" : "info"}
                    visible={true}
                >
                    {!locationField.address
                        ? "Location is required so other hobbyists can find you."
                        : "Your exact coordinates are never shown to other users."
                    }
                </HelperText>
            </View>

            <Controller
                control={control}
                name="publicContactInfo"
                rules={{ required: 'Contact information is required' }}
                render={({ field: { onChange, value, onBlur } }) => (
                    <View style={styles.inputGap}>
                        <TextInput
                            label="Public Contact Info (e.g. Instagram, WhatsApp)"
                            value={value}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            error={!!errors.publicContactInfo}
                            disabled={isLoading}
                            mode="outlined"
                        />
                        {errors.publicContactInfo && (
                            <HelperText type="error">{errors.publicContactInfo.message}</HelperText>
                        )}
                    </View>
                )}
            />

            <Button
                mode="contained"
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                disabled={isLoading}
                style={styles.submitButton}
            >
                <Text>Save Changes</Text>
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
    submitButton: {marginTop: 18},
});