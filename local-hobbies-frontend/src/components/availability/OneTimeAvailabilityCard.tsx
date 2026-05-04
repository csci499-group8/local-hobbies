import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Card, Text, IconButton, useTheme} from 'react-native-paper';
import {DateTime, Duration} from 'luxon';
import {OneTimeAvailabilityResponse} from '@/src/types/availability';

interface Props {
    item: OneTimeAvailabilityResponse;
    onEdit: () => void;
    onDelete: () => void;
}

export const OneTimeAvailabilityCard = ({item, onEdit, onDelete}: Props) => {
    const theme = useTheme();
    const start = DateTime.fromISO(item.start);
    const end = start.plus(Duration.fromISO(item.duration));

    return (
        <Card style={styles.card} mode="outlined">
            <Card.Content style={styles.content}>
                <View style={styles.info}>
                    <Text variant="titleSmall">
                        {start.toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)}
                    </Text>
                    <Text variant="bodySmall" style={styles.time}>
                        {start.toLocaleString(DateTime.TIME_SIMPLE)} – {end.toLocaleString(DateTime.TIME_SIMPLE)}
                    </Text>
                </View>
                <View style={styles.actions}>
                    <IconButton icon="pencil" size={20} onPress={onEdit} />
                    <IconButton icon="delete" size={20} iconColor={theme.colors.error} onPress={onDelete} />
                </View>
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {marginBottom: 8, backgroundColor: '#fff'},
    content: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
    info: {flex: 1, gap: 2},
    time: {opacity: 0.6},
    actions: {flexDirection: 'row'},
});