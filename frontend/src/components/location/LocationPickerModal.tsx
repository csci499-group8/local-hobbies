// Full-screen modal wrapper for LocationPicker.
// Used by availability forms and any other form needing a GeoJsonPoint.

import React from 'react';
import {StyleSheet} from 'react-native';
import {Modal, Portal} from 'react-native-paper';
import {GeoJsonPoint} from '@/src/types/common';
import {LocationPicker} from './LocationPicker';
import {theme} from '@/src/theme';

interface Props {
    visible: boolean;
    initialLocation?: GeoJsonPoint;
    onConfirm: (location: GeoJsonPoint, address: string) => void;
    onDismiss: () => void;
}

export const LocationPickerModal = ({visible, initialLocation, onConfirm, onDismiss}: Props) => (
    <Portal>
        <Modal
            visible={visible}
            onDismiss={onDismiss}
            contentContainerStyle={styles.modal}
        >
            <LocationPicker
                initialLocation={initialLocation}
                onConfirm={onConfirm}
                onDismiss={onDismiss}
            />
        </Modal>
    </Portal>
);

const styles = StyleSheet.create({
    modal: {flex: 1, margin: 0, backgroundColor: theme.colors.surface},
});