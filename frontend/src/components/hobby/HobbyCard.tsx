import React from 'react';
import {router} from 'expo-router';
import {StyleSheet, View} from 'react-native';
import {Card, Text, IconButton, Chip} from 'react-native-paper';
import {HobbyResponse} from '@/src/types/hobby';
import {commonStyles, theme} from '@/src/theme';

interface Props {
    hobby: HobbyResponse;
    onEdit: () => void;
    onDelete: () => void;
}

export const HobbyCard = ({hobby, onEdit, onDelete}: Props) => {
    return (
        <Card style={styles.card} mode="outlined">
            <Card.Content style={styles.content}>
                <View style={styles.info}>
                    <Text variant="titleMedium">{hobby.name}</Text>
                    <Text variant="bodySmall" style={styles.hobbyCategory}>
                        {hobby.category}
                    </Text>
                    <View style={styles.chipRow}>
                        <Chip
                            compact
                            mode="flat"
                            style={styles.chip}
                            textStyle={{ color: theme.colors.primary }}
                        >
                            {hobby.experienceLevel}
                        </Chip>
                    </View>
                </View>
                <View style={styles.actions}>
                    <IconButton
                        icon="image-multiple"
                        size={20}
                        iconColor={theme.colors.primary}
                        onPress={() => router.push({
                            pathname: '/hobbies/[hobbyId]/photos',
                            params: {hobbyId: hobby.id},
                        })}
                    />
                    <IconButton
                        icon="pencil"
                        size={20}
                        iconColor={theme.colors.primary}
                        onPress={onEdit}
                    />
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
    content: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.colors.tertiaryLight},
    info: {flex: 1, gap: 2},
    hobbyCategory: {color: theme.colors.primary, opacity: 0.6},
    chipRow: {flexDirection: 'row', marginTop: 8},
    chip: {borderColor: theme.colors.tertiary, backgroundColor: theme.colors.tertiary},
    actions: {flexDirection: 'row'},
});