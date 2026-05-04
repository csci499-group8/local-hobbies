// Minimal hobby builder for onboarding — uses HobbyCreationRequest[]
// rather than the full hobby management screen.

import React, {useState} from 'react';
import {View, StyleSheet, Alert} from 'react-native';
import {Button, Text, Chip} from 'react-native-paper';
import {useHobby} from '@/src/hooks/useHobby';
import {HobbyCreationRequest} from '@/src/types/hobby';
import {HobbyForm} from '@/src/components/hobby/HobbyForm';
import {Portal, Modal} from 'react-native-paper';

interface Props {
    initialValue?: HobbyCreationRequest[];
    onComplete: (hobbies: HobbyCreationRequest[]) => void;
    isSubmitting: boolean;
}

export const OnboardingHobbiesStep = ({initialValue, onComplete, isSubmitting}: Props) => {
    const {globalHobbies, globalHobbiesLoading} = useHobby();
    const [hobbies, setHobbies] = useState<HobbyCreationRequest[]>(initialValue ?? []);
    const [showForm, setShowForm] = useState(false);

    const handleAdd = (request: HobbyCreationRequest) => {
        setHobbies(prev => [...prev, request]);
        setShowForm(false);
    };

    const handleRemove = (name: string) => {
        setHobbies(prev => prev.filter(h => h.name !== name));
    };

    const handleContinue = () => {
        if (hobbies.length === 0) {
            Alert.alert('Hobbies required', 'Please add at least one hobby to continue.');
            return;
        }
        onComplete(hobbies);
    };

    return (
        <View style={styles.container}>
            <Text variant="bodyMedium" style={styles.description}>
                Add at least one hobby. This is how you'll be matched with others.
            </Text>

            {hobbies.length > 0 && (
                <View style={styles.chipRow}>
                    {hobbies.map(h => (
                        <Chip
                            key={h.name}
                            onClose={() => handleRemove(h.name)}
                            style={styles.chip}
                        >
                            {h.name} · {h.experienceLevel}
                        </Chip>
                    ))}
                </View>
            )}

            <Button
                mode="outlined"
                icon="plus"
                onPress={() => setShowForm(true)}
                disabled={isSubmitting || globalHobbiesLoading}
            >
                Add Hobby
            </Button>

            <Button
                mode="contained"
                onPress={handleContinue}
                disabled={hobbies.length === 0 || isSubmitting}
                style={styles.button}
            >
                Continue
            </Button>

            <Portal>
                <Modal
                    visible={showForm}
                    onDismiss={() => setShowForm(false)}
                    contentContainerStyle={styles.modal}
                >
                    <HobbyForm
                        globalHobbies={globalHobbies}
                        onSubmit={async req => handleAdd(req as HobbyCreationRequest)}
                        onDismiss={() => setShowForm(false)}
                        isSubmitting={false}
                    />
                </Modal>
            </Portal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {gap: 16},
    description: {opacity: 0.6, lineHeight: 20},
    chipRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
    chip: {backgroundColor: '#f0f0f0'},
    button: {marginTop: 8},
    modal: {backgroundColor: 'white', margin: 24, borderRadius: 12, padding: 24},
});