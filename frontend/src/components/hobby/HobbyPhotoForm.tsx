// Form handling photo creation and caption editing (caption only; photo cannot
// be changed after upload).

import React, {useMemo, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {Button, Text, TextInput, HelperText} from 'react-native-paper';
import {useForm, Controller} from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';
import {Image} from 'expo-image';
import {HobbyPhotoUpdateRequest, HobbyResponse} from '@/src/types/hobby';
import {spacing, commonStyles} from '@/src/theme';
import {SearchablePickerModal} from '@/src/components/common/SearchablePickerModal';

type FormValues = {
    hobbyId: string;
    caption: string;
};

type Props =
    | {
    mode: 'create';
    hobbies: HobbyResponse[];
    fixedHobbyId?: string; //if creating from hobbies/[hobbyId]/photos.tsx, do not allow user to select a hobby
    onSubmit: (
        hobbyId: string,
        photo: {uri: string; name: string; type: string},
        caption?: string | null
    ) => Promise<void>;
    onDismiss: () => void;
    isSubmitting: boolean;
}
    | {
    mode: 'edit';
    initialCaption: string | null;
    onSubmit: (request: HobbyPhotoUpdateRequest) => Promise<void>;
    onDismiss: () => void;
    isSubmitting: boolean;
};

export const HobbyPhotoForm = (props: Props) => {
    const [photoAsset, setPhotoAsset] = useState<{uri: string; name: string; type: string} | null>(null);
    const [hobbyPickerVisible, setHobbyPickerVisible] = useState(false);

    const {control, handleSubmit, setError, watch, setValue, formState: {errors}} = useForm<FormValues>({
        defaultValues: {
            hobbyId: props.mode === 'create' ? (props.fixedHobbyId ?? props.hobbies[0]?.id ?? '') : '',
            caption: props.mode === 'edit' ? (props.initialCaption ?? '') : '',
        },
    });

    const hobbyItems = useMemo(() =>
        props.mode === 'create'
            ? props.hobbies.map(h => ({
                label: `${h.name} (${h.experienceLevel})`,
                value: h.id,
            }))
            : [],
        [props.mode === 'create' ? props.hobbies : null]
    );

    const hobbyIdValue = watch('hobbyId');
    const selectedHobbyLabel = hobbyIdValue && props.mode === 'create'
        ? hobbyItems.find(i => i.value === hobbyIdValue)?.label ?? hobbyIdValue
        : 'Select a hobby...';

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            const asset = result.assets[0];
            setPhotoAsset({
                uri: asset.uri,
                name: asset.fileName ?? 'photo.jpg',
                type: asset.mimeType ?? 'image/jpeg',
            });
        }
    };

    const handleFormSubmit = (values: FormValues) => {
        const caption = values.caption.trim() || null;
        if (props.mode === 'create') {
            if (!photoAsset) {
                setError('root', {message: 'Please select a photo'});
                return;
            }
            props.onSubmit(values.hobbyId, photoAsset, caption); //props.fixedHobbyId ?? values.hobbyId
        } else {
            props.onSubmit({caption});
        }
    };

    return (
        <View style={styles.container}>
            <Text variant="titleLarge" style={styles.title}>
                {props.mode === 'create' ? 'Add Photo' : 'Edit Photo'}
            </Text>

            {/* Photo picker — create mode only */}
            {props.mode === 'create' && (
                <>
                    <View style={styles.field}>
                        {photoAsset ? (
                            <>
                                <Image
                                    source={{uri: photoAsset.uri}}
                                    style={styles.preview}
                                    contentFit="cover"
                                />
                                <Button
                                    mode="text"
                                    onPress={pickImage}
                                    disabled={props.isSubmitting}
                                >
                                    Change Photo
                                </Button>
                            </>
                        ) : (
                            <Button
                                mode="outlined"
                                icon="image-plus"
                                onPress={pickImage}
                                disabled={props.isSubmitting}
                                style={commonStyles.lightBackground}
                            >
                                Select Photo
                            </Button>
                        )}
                        {errors.root && (
                            <HelperText type="error">{errors.root.message}</HelperText>
                        )}
                    </View>

                    {/* Hobby selector — create mode only */}
                    {!props.fixedHobbyId && props.hobbies.length > 1 && (
                        <Controller
                            control={control}
                            name="hobbyId"
                            rules={{required: 'Please select a hobby'}}
                            render={() => (
                                <View style={styles.field}>
                                    <Text variant="labelLarge">Hobby</Text>
                                    <Button
                                        mode="outlined"
                                        icon="chevron-down"
                                        onPress={() => setHobbyPickerVisible(true)}
                                        disabled={props.isSubmitting}
                                        contentStyle={styles.pickerButtonContent}
                                        style={commonStyles.lightBackground}
                                    >
                                        {selectedHobbyLabel}
                                    </Button>
                                    {errors.hobbyId && (
                                        <HelperText type="error">{errors.hobbyId.message}</HelperText>
                                    )}
                                </View>
                            )}
                        />
                    )}
                </>
            )}

            {/* Hobby search modal */}
            {props.mode === 'create' && !props.fixedHobbyId && props.hobbies.length > 1 && (
                <SearchablePickerModal
                    visible={hobbyPickerVisible}
                    title="Select Hobby"
                    items={hobbyItems}
                    selectedValue={hobbyIdValue}
                    onSelect={(val) => setValue('hobbyId', val, {shouldValidate: true})}
                    onDismiss={() => setHobbyPickerVisible(false)}
                />
            )}

            {/* Caption */}
            <Controller
                control={control}
                name="caption"
                render={({field: {onChange, value}}) => (
                    <View style={styles.field}>
                        <TextInput
                            label="Caption (optional)"
                            value={value}
                            onChangeText={onChange}
                            mode="outlined"
                            disabled={props.isSubmitting}
                            style={commonStyles.lightBackground}
                        />
                        {errors.caption && (
                            <HelperText type="error">{errors.caption.message}</HelperText>
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
                    {props.mode === 'create' ? 'Add' : 'Save'}
                </Button>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {gap: spacing.lg},
    title: commonStyles.sectionTitle,
    field: {gap: spacing.sm},
    pickerButtonContent: {flexDirection: 'row-reverse'},
    preview: {width: '100%', aspectRatio: 1, borderRadius: 12},
    footer: commonStyles.footer,
    footerButton: commonStyles.footerButton,
});