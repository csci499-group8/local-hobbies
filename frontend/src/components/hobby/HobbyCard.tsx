import React from 'react';
import {router} from 'expo-router';
import {StyleSheet, View} from 'react-native';
import {Card, Text, IconButton, Chip, useTheme} from 'react-native-paper';
import {HobbyResponse} from '@/src/types/hobby';
import {commonStyles, theme} from '@/src/theme';

interface Props {
    hobby: HobbyResponse;
    onEdit: () => void;
    onDelete: () => void;
}

export const HobbyCard = ({hobby, onEdit, onDelete}: Props) => {
    const theme = useTheme();

    return (
        <Card style={styles.card} mode="outlined">
            <Card.Content style={styles.content}>
                <View style={styles.info}>
                    <Text variant="titleMedium">{hobby.name}</Text>
                    <Text variant="bodySmall" style={{color: theme.colors.outline}}>
                        {hobby.category}
                    </Text>
                    <View style={styles.chipRow}>
                        <Chip compact mode="flat" style={styles.chip}>
                            {hobby.experienceLevel}
                        </Chip>
                    </View>
                </View>
                <View style={styles.actions}>
                    <IconButton
                        icon="image-multiple"
                        size={20}
                        onPress={() => router.push({
                            pathname: '/hobbies/[hobbyId]/photos',
                            params: {hobbyId: hobby.id},
                        })}
                    />
                    <IconButton icon="pencil" size={20} onPress={onEdit} />
                    <IconButton
                        icon="delete"
                        size={20}
                        iconColor={theme.colors.error}
                        onPress={onDelete}
                    />
                </View>
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {marginBottom: 12, ...commonStyles.card},
    content: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
    info: {flex: 1, gap: 2},
    chipRow: {flexDirection: 'row', marginTop: 8},
    chip: {backgroundColor: theme.colors.surfaceInput},
    actions: {flexDirection: 'row'},
});