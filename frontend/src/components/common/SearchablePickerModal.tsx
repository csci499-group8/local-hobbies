// Generic searchable picker modal: Searchbar + FlatList inside a Paper Modal.
// Used wherever a <Picker> over a large list would have been used.

import React, {useEffect, useState} from 'react';
import {FlatList, StyleSheet} from 'react-native';
import {Button, List, Modal, Portal, Searchbar, Text} from 'react-native-paper';
import {spacing, theme} from '@/src/theme';

export interface PickerItem {
    label: string;
    value: string;
}

interface Props {
    visible: boolean;
    title: string;
    items: PickerItem[];
    selectedValue: string;
    onSelect: (value: string) => void;
    onDismiss: () => void;
}

export const SearchablePickerModal = ({visible, title, items, selectedValue, onSelect, onDismiss}: Props) => {
    const [query, setQuery] = useState('');

    // Clear search when modal closes so it's fresh next open
    useEffect(() => {
        if (!visible) setQuery('');
    }, [visible]);

    const filtered = items.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onDismiss}
                contentContainerStyle={styles.modal}
            >
                <Text variant="titleMedium" style={styles.title}>{title}</Text>
                <Searchbar
                    placeholder="Search..."
                    value={query}
                    onChangeText={setQuery}
                    style={styles.searchbar}
                />
                <FlatList
                    data={filtered}
                    initialNumToRender={10}
                    keyExtractor={item => item.value}
                    style={styles.list}
                    keyboardShouldPersistTaps="handled"
                    renderItem={({item}) => {
                        const isSelected = item.value === selectedValue;
                        return (
                            <List.Item
                                title={item.label}
                                titleStyle={isSelected ? { color: theme.colors.primary, fontWeight: 'bold' } : {}} //TODO: add style to stylesheet
                                onPress={() => {
                                    onSelect(item.value);
                                    onDismiss();
                                }}
                                right={item.value === selectedValue
                                    ? props => <List.Icon {...props} icon="check" />
                                    : undefined
                                }
                            />
                        );
                    }}
                    ListEmptyComponent={
                        <Text style={{ textAlign: 'center', marginVertical: 20, opacity: 0.6 }}>
                            No results found for "{query}"
                        </Text>
                    }
                />
                <Button mode="outlined" onPress={onDismiss} style={styles.cancelButton}>
                    Cancel
                </Button>
            </Modal>
        </Portal>
    );
};

const styles = StyleSheet.create({
    modal: {
        backgroundColor: 'white',
        margin: spacing.lg,
        borderRadius: 12,
        padding: spacing.lg,
        maxHeight: '80%',
    },
    title: {marginBottom: spacing.md},
    searchbar: {marginBottom: spacing.sm},
    list: {flexGrow: 0},
    cancelButton: {marginTop: spacing.md},
    lightBackground: {backgroundColor: theme.colors.surfaceVariant},
});
