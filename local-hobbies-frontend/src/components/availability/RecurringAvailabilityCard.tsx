import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Card, Text, IconButton, Chip, useTheme} from 'react-native-paper';
import {DateTime, Duration} from 'luxon';
import {RecurringAvailabilityResponse} from '@/src/types/availability';

interface Props {
    item: RecurringAvailabilityResponse;
    onEdit: () => void;
    onDelete: () => void;
    onAddException: () => void;
}

export const RecurringAvailabilityCard = ({item, onEdit, onDelete, onAddException}: Props) => {
    const theme = useTheme();
    const ruleStart = DateTime.fromISO(item.ruleStart).toLocaleString(DateTime.DATE_MED);
    const ruleEnd = item.ruleEnd
        ? DateTime.fromISO(item.ruleEnd).toLocaleString(DateTime.DATE_MED)
        : 'ongoing';
    const startTime = DateTime.fromISO(`2000-01-01T${item.startTime}`).toLocaleString(DateTime.TIME_SIMPLE);
    const duration = Duration.fromISO(item.duration).toHuman();

    return (
        <Card style={styles.card} mode="outlined">
            <Card.Content style={styles.content}>
                <View style={styles.info}>
                    <Text variant="titleSmall">{item.frequency}</Text>
                    <Text variant="bodySmall" style={styles.sub}>
                        {startTime} · {duration}
                    </Text>
                    <Text variant="bodySmall" style={styles.sub}>
                        {ruleStart} – {ruleEnd}
                    </Text>
                    {item.startDayOfWeek && (
                        <Chip compact mode="flat" style={styles.chip}>{item.startDayOfWeek}</Chip>
                    )}
                </View>
                <View style={styles.actions}>
                    <IconButton icon="plus-circle-outline" size={20} onPress={onAddException} />
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
    info: {flex: 1, gap: 4},
    sub: {opacity: 0.6},
    chip: {alignSelf: 'flex-start', backgroundColor: '#f0f0f0'},
    actions: {flexDirection: 'row'},
});