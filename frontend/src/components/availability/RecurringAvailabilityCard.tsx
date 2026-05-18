import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Card, Text, IconButton, Chip, useTheme, Tooltip} from 'react-native-paper';
import {DateTime} from 'luxon';
import {RecurringAvailabilityResponse} from '@/src/types/availability';
import {formatDuration} from "@/src/utils/date-helpers";
import {commonStyles, theme} from '@/src/theme';

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
    const duration = formatDuration(item.duration);
    const startDay = item.startDayOfWeek
        ? item.startDayOfWeek.charAt(0).toUpperCase() + item.startDayOfWeek.slice(1).toLowerCase()
        : item.startDayOfMonth;

    return (
        <Card style={styles.card} mode="outlined">
            <Card.Content style={styles.content}>
                <View style={styles.info}>
                    <Text variant="titleSmall">
                        {item.frequency} · {startDay}
                    </Text>
                    <Text variant="bodySmall" style={styles.sub}>
                        {startTime} · {duration}
                    </Text>
                    <Text variant="bodySmall" style={styles.sub}>
                        {ruleStart} – {ruleEnd}
                    </Text>
                </View>
                <View style={styles.actions}>
                    <Tooltip title="Add Exception">
                        <IconButton
                            icon="calendar-remove"
                            size={20}
                            iconColor={theme.colors.primary}
                            onPress={onAddException}
                        />
                    </Tooltip>
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
    card: {marginBottom: 8, ...commonStyles.card},
    content: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
    info: {flex: 1, gap: 4},
    sub: {opacity: 0.6},
    actions: {flexDirection: 'row'},
});