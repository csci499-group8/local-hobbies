import React, {useState} from 'react';
import {ScrollView, StyleSheet, View, Alert} from 'react-native';
import {Text, Appbar, FAB, Portal, Modal, ActivityIndicator} from 'react-native-paper';
import {useHobby} from '@/src/hooks/useHobby';
import {HobbyCard} from '@/src/components/hobby/HobbyCard';
import {HobbyForm} from '@/src/components/hobby/HobbyForm';
import {HobbyResponse, HobbyCreationRequest, HobbyUpdateRequest} from '@/src/types/hobby';
import {router} from "expo-router";

type ActiveHobbyState =
    | {type: 'CLOSED'}
    | {type: 'CREATING'}
    | {type: 'EDITING'; hobby: HobbyResponse};

export default function HobbiesScreen() {
    const {
        hobbies,
        hobbiesLoading,
        hobbiesError,
        globalHobbies,
        globalHobbiesLoading,
        addHobby,
        updateHobby,
        deleteHobby,
    } = useHobby();

    const [activeHobbyState, setActiveHobbyState] = useState<ActiveHobbyState>({type: 'CLOSED'});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFormSubmit = async (request: HobbyCreationRequest | HobbyUpdateRequest) => {
        setIsSubmitting(true);
        try {
            if (activeHobbyState.type === 'EDITING') {
                await updateHobby({
                    hobbyId: activeHobbyState.hobby.id,
                    request: request as HobbyUpdateRequest,
                });
            } else {
                await addHobby(request as HobbyCreationRequest);
            }
            setActiveHobbyState({type: 'CLOSED'});
        } catch (e: unknown) {
            Alert.alert('Error', e instanceof Error ? e.message : 'An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (hobby: HobbyResponse) => {
        Alert.alert(
            'Remove Hobby',
            `Are you sure you want to remove ${hobby.name}?`,
            [
                {text: 'Cancel', style: 'cancel'},
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteHobby(hobby.id);
                        } catch (e: unknown) {
                            Alert.alert('Error', e instanceof Error ? e.message : 'An unexpected error occurred');
                        }
                    },
                },
            ]
        );
    };

    if (hobbiesLoading || globalHobbiesLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (hobbiesError) {
        return (
            <View style={styles.centered}>
                <Text variant="bodyLarge">Error loading hobbies: {hobbiesError}</Text>
            </View>
        );
    }

    return (
        <View style={styles.screen}>
            <Appbar.Header>
                <Appbar.Content title="My Hobbies" />
                <Appbar.Action
                    icon="camera-burst"
                    onPress={() => router.push('/hobbies/photos')}
                    accessibilityLabel="All Hobby Photos"
                />
            </Appbar.Header>

            <ScrollView contentContainerStyle={styles.list}>
                {hobbies.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text variant="bodyLarge">You haven't added any hobbies yet.</Text>
                        <Text variant="bodyMedium" style={styles.emptySubtext}>
                            Tap the + button to get started!
                        </Text>
                    </View>
                ) : (
                    hobbies.map(hobby => (
                        <HobbyCard
                            key={hobby.id}
                            hobby={hobby}
                            onEdit={() => setActiveHobbyState({type: 'EDITING', hobby})}
                            onDelete={() => handleDelete(hobby)}
                        />
                    ))
                )}
            </ScrollView>

            <Portal>
                <Modal
                    visible={activeHobbyState.type !== 'CLOSED'}
                    // Prevent dismissal mid-submission to avoid cache race conditions
                    onDismiss={() => !isSubmitting && setActiveHobbyState({type: 'CLOSED'})}
                    contentContainerStyle={styles.modal}
                >
                    <HobbyForm
                        hobby={activeHobbyState.type === 'EDITING' ? activeHobbyState.hobby : undefined}
                        globalHobbies={globalHobbies}
                        onSubmit={handleFormSubmit}
                        onDismiss={() => setActiveHobbyState({type: 'CLOSED'})}
                        isSubmitting={isSubmitting}
                    />
                </Modal>
            </Portal>

            <FAB
                icon="plus"
                label="Add Hobby"
                style={styles.fab}
                onPress={() => setActiveHobbyState({type: 'CREATING'})}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {flex: 1, backgroundColor: '#f8f9fa'},
    centered: {flex: 1, justifyContent: 'center', alignItems: 'center'},
    list: {padding: 16, paddingBottom: 100},
    emptyContainer: {marginTop: 100, alignItems: 'center', gap: 8},
    emptySubtext: {opacity: 0.6},
    fab: {position: 'absolute', margin: 16, right: 0, bottom: 0},
    modal: {backgroundColor: 'white', margin: 24, borderRadius: 12, padding: 24},
});