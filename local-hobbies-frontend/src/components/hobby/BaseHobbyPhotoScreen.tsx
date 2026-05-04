// Shared content for both /hobbies/photos and /hobbies/[hobbyId]/photos.
// Owns the modal state, CRUD handlers, and grid rendering.
// The parent screen provides the photo data, write mutations, and title.

import React, {useState} from 'react';
import {ScrollView, StyleSheet, View, Alert} from 'react-native';
import {FAB, Portal, Modal} from 'react-native-paper';
import {useHobby} from '@/src/hooks/useHobby';
import {HobbyPhotoGrid} from './HobbyPhotoGrid';
import {HobbyPhotoForm} from './HobbyPhotoForm';
import {HobbyPhotoResponse, HobbyPhotoUpdateRequest, HobbyResponse} from '@/src/types/hobby';
import {HobbyPhotoGroupedGrid} from "@/src/components/hobby/HobbyPhotoGroupedGrid";
import {HobbyPhotoExpandedModal} from "@/src/components/hobby/HobbyPhotoExpandedModal";

type ActivePhotoState =
    | {type: 'CLOSED'}
    | {type: 'CREATING'}
    | {type: 'EDITING'; photo: HobbyPhotoResponse};

type Props =
    | { grid: 'flat'; hobbyId: string; photos: HobbyPhotoResponse[] }
    | { grid: 'grouped'; hobbies: HobbyResponse[]; photos: HobbyPhotoResponse[] };

export const BaseHobbyPhotoScreen = (props: Props) => {
    const {addHobbyPhoto, updateHobbyPhoto, deleteHobbyPhoto} = useHobby();
    const [activePhotoState, setActivePhotoState] = useState<ActivePhotoState>({type: 'CLOSED'});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [expandedPhoto, setExpandedPhoto] = useState<HobbyPhotoResponse | null>(null);

    const handleCreate = async (
        hobbyId: string,
        photo: {uri: string; name: string; type: string},
        caption?: string | null
    ) => {
        setIsSubmitting(true);
        try {
            await addHobbyPhoto({hobbyId, photo, caption});
            setActivePhotoState({type: 'CLOSED'});
        } catch (e: unknown) {
            Alert.alert('Error', e instanceof Error ? e.message : 'An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async (request: HobbyPhotoUpdateRequest) => {
        if (activePhotoState.type !== 'EDITING') return;
        setIsSubmitting(true);
        try {
            await updateHobbyPhoto({photoId: activePhotoState.photo.id, request});
            setActivePhotoState({type: 'CLOSED'});
        } catch (e: unknown) {
            Alert.alert('Error', e instanceof Error ? e.message : 'An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView>
                {props.grid === 'grouped' ? (
                    <HobbyPhotoGroupedGrid
                        photos={props.photos}
                        onPress={photo => setExpandedPhoto(photo)}
                        onEdit={photo => setActivePhotoState({ type: 'EDITING', photo })}
                        onDelete={p => deleteHobbyPhoto(p.id)}
                    />
                ) : (
                    <HobbyPhotoGrid
                        photos={props.photos}
                        onPress={photo => setExpandedPhoto(photo)}
                        onEdit={photo => setActivePhotoState({ type: 'EDITING', photo })}
                        onDelete={p => deleteHobbyPhoto(p.id)}
                    />
                )}
            </ScrollView>

            <Portal>
                <Modal
                    visible={activePhotoState.type !== 'CLOSED'}
                    onDismiss={() => !isSubmitting && setActivePhotoState({type: 'CLOSED'})}
                    contentContainerStyle={styles.modal}
                >
                    {activePhotoState.type === 'EDITING' ? (
                        <HobbyPhotoForm
                            mode="edit"
                            initialCaption={activePhotoState.photo.caption}
                            onSubmit={handleUpdate}
                            onDismiss={() => setActivePhotoState({type: 'CLOSED'})}
                            isSubmitting={isSubmitting}
                        />
                    ) : (
                        <HobbyPhotoForm
                            mode="create"
                            hobbies={props.grid === 'grouped' ? props.hobbies : []}
                            fixedHobbyId={props.grid === 'flat' ? props.hobbyId : undefined}
                            onSubmit={handleCreate}
                            onDismiss={() => setActivePhotoState({type: 'CLOSED'})}
                            isSubmitting={isSubmitting}
                        />
                    )}
                </Modal>

                <HobbyPhotoExpandedModal
                    photo={expandedPhoto}
                    onDismiss={() => setExpandedPhoto(null)}
                />
            </Portal>

            <FAB
                icon="plus"
                label="Add Photo"
                style={styles.fab}
                onPress={() => setActivePhotoState({type: 'CREATING'})}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
    modal: { backgroundColor: 'white', margin: 20, borderRadius: 12, padding: 24 }
});