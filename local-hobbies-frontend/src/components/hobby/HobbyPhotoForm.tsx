// Form handling photo creation and caption editing (caption only; photo cannot
// be changed after upload).

import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {Button, Text, TextInput, HelperText} from 'react-native-paper';
import {useForm, Controller} from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';
import {Image} from 'expo-image';
import {Picker} from '@react-native-picker/picker';
import {HobbyPhotoUpdateRequest, HobbyResponse} from '@/src/types/hobby';

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

    const {control, handleSubmit, setError, formState: {errors}} = useForm<FormValues>({
        defaultValues: {
            hobbyId: props.mode === 'create' ? (props.fixedHobbyId ?? props.hobbies[0]?.id ?? '') : '',
            caption: props.mode === 'edit' ? (props.initialCaption ?? '') : '',
        },
    });

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
                            render={({field: {onChange, value}}) => (
                                <View style={styles.field}>
                                    <Text variant="labelLarge">Hobby</Text>
                                    <View style={styles.pickerBorder}>
                                        <Picker selectedValue={value} onValueChange={onChange}>
                                            {props.hobbies.map(h => (
                                                <Picker.Item
                                                    key={h.id}
                                                    label={`${h.name} (${h.experienceLevel})`}
                                                    value={h.id}
                                                />
                                            ))}
                                        </Picker>
                                    </View>
                                    {errors.hobbyId && (
                                        <HelperText type="error">{errors.hobbyId.message}</HelperText>
                                    )}
                                </View>
                            )}
                        />
                    )}
                </>
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
    container: { gap: 16 },
    title: { fontWeight: 'bold' },
    field: { gap: 8 },
    pickerBorder: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8 },
    preview: { width: '100%', aspectRatio: 1, borderRadius: 12 },
    footer: { flexDirection: 'row', gap: 12 },
    footerButton: { flex: 1 }
});