import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Card, Text, IconButton, Chip, useTheme} from 'react-native-paper';
import {DateTime} from 'luxon';
import {AvailabilityExceptionResponse} from '@/src/types/availability';
import {commonStyles, theme} from '@/src/theme';

interface Props {
    item: AvailabilityExceptionResponse;
    onEdit: () => void;
    onDelete: () => void;
}

export const AvailabilityExceptionCard = ({item, onEdit, onDelete}: Props) => {
    const theme = useTheme();
    const date = DateTime.fromISO(item.exceptionDate).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY);

    return (
        <Card style={styles.card} mode="outlined">
            <Card.Content style={styles.content}>
                <View style={styles.info}>
                    <Text variant="titleSmall">{date}</Text>
                    <Chip
                        compact
                        mode="flat"
                        style={[styles.chip, item.isCancelled && styles.cancelledChip]}
                    >
                        {item.isCancelled ? 'Cancelled' : 'Modified'}
                    </Chip>
                    {item.exceptionReason ? (
                        <Text variant="bodySmall" style={styles.sub}>{item.exceptionReason}</Text>
                    ) : null}
                    {item.overrideStartTime && (
                        <Text variant="bodySmall" style={styles.sub}>
                            New time: {DateTime.fromISO(`2000-01-01T${item.overrideStartTime}`).toLocaleString(DateTime.TIME_SIMPLE)}
                        </Text>
                    )}
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
    card: {marginBottom: 8, ...commonStyles.card},
    content: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
    info: {flex: 1, gap: 4},
    sub: {opacity: 0.6},
    chip: {alignSelf: 'flex-start', backgroundColor: theme.colors.surfaceInput},
    cancelledChip: {backgroundColor: theme.colors.cancelled},
    actions: {flexDirection: 'row'},
});