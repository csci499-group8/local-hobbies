import React, {useMemo, useState} from 'react';
import {FlatList, Platform, StyleSheet, View} from 'react-native';
import {Button, Divider, List, Modal, Portal, Surface, Text, useTheme} from 'react-native-paper';
import MapView, {Marker} from 'react-native-maps';
import {DateTime} from 'luxon';
import {AvailabilityType, AvailabilityIntervalResponse, AvailabilityOverlapResponse} from '@/src/types/availability';
import {GeoJsonPoint} from '@/src/types/common';
import {spacing, commonStyles, theme, colors} from '@/src/theme';

// This component accepts either AvailabilityIntervalResponse (user's own schedule) or
// AvailabilityOverlapResponse (user's overlap with another user) via a discriminated
// union prop type. The `mode` field acts as the discriminator, giving TypeScript the
// ability to enforce that the correct interval type is passed for each mode. In schedule
// mode, tapping a List.Item opens a map view centered on the event's GeoJsonPoint.
type Props =
    | {mode: 'schedule'; intervals: AvailabilityIntervalResponse[], maxHeight?: number}
    | {mode: 'overlap'; intervals: AvailabilityOverlapResponse[], maxHeight?: number};

// Normalized internal shape. `location` field is used depending on mode.
interface DayEvent {
    start: string;
    end: string;
    label: string;
    icon: string;
    location?: GeoJsonPoint;
}

// FlatList data unit: one group per calendar date
interface DayGroup {
    date: string;
    events: DayEvent[];
}

// Mapping from AvailabilityType to normalized interval icon
const AVAILABILITY_TYPE_ICONS: Record<string, string> = {
    [AvailabilityType.OneTimeAvailability]: 'calendar-week-begin',
    [AvailabilityType.RecurringAvailability]: 'calendar-refresh',
    [AvailabilityType.AvailabilityException]: 'calendar-remove',
};

// Intervals are normalized from API response types into a shared DayEvent shape
// before any grouping or rendering occurs. This decouples the UI from the API.
const normalizeIntervals = (props: Props): DayEvent[] => {
    if (props.mode === 'schedule') {
        return props.intervals.map(i => ({
            start: i.start,
            end: i.end,
            label: i.sourceType,
            icon: AVAILABILITY_TYPE_ICONS[i.sourceType] ?? 'calendar-clock',
            location: i.location,
        }));
    }
    return props.intervals.map(i => ({
        start: i.start,
        end: i.end,
        label: `Approx. ${i.distanceKilometers.toFixed(1)} km away`,
        icon: 'set-left-center',
    }));
};

// Groups normalized events by ISO date string, sorts days chronologically,
// and sorts events within each day by start time.
const groupByDate = (events: DayEvent[]): DayGroup[] => {
    const groups = new Map<string, DayEvent[]>();

    //group by date
    events.forEach(event => {
        const date = DateTime.fromISO(event.start).toISODate()!;
        if (!groups.has(date)) groups.set(date, []);
        groups.get(date)!.push(event);
    });

    //sort by start time (ISO strings sort correctly lexicographically)
    return Array.from(groups.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, events]) => ({
            date,
            events: events.sort((a, b) =>
                DateTime.fromISO(a.start).toMillis() - DateTime.fromISO(b.start).toMillis()
            ),
        }));
};

export const AvailabilityCalendar = (props: Props) => {
    const theme = useTheme();

    // selectedEvent drives the map modal — null means modal is closed
    const [selectedEvent, setSelectedEvent] = useState<DayEvent | null>(null);

    // Groups are memoized via `useMemo` so grouping and sorting only recompute when
    // `props` changes. `FlatList` is used inside a `ScrollView` so that only visible day
    // groups are rendered — important for users with many availabilities spread across weeks.
    const groups = useMemo(() => {
        const events = normalizeIntervals(props);
        return groupByDate(events);
    }, [props]);

    //calculate calendar height
    const totalEvents = groups.reduce((sum, group) => sum + group.events.length, 0);
    const dynamicHeight = Math.min(
        Math.max(
            (groups.length * 45) + (totalEvents * 72) + 32, //estimated height = day headers + day events + padding
            MIN_CALENDAR_HEIGHT
        ),
        MAX_CALENDAR_HEIGHT
    );

    if (groups.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text variant="bodyMedium" style={styles.emptyText}>
                    {props.mode === 'schedule'
                        ? 'No upcoming availabilities.'
                        : 'No overlapping availability windows found.'}
                </Text>
            </View>
        );
    }

    // Events are grouped by date and rendered as a single date header + `Surface`
    // per day, with `List.Item` rows and `Divider` separators between them.
    const renderGroup = ({item}: {item: DayGroup}) => (
        <View style={styles.daySection}>
            <Text variant="labelLarge" style={styles.dayHeader}>
                {DateTime.fromISO(item.date).toLocaleString(DateTime.DATE_HUGE)}
            </Text>
            <Surface style={styles.surface} elevation={1}>
                {item.events.map((event, index) => (
                    <React.Fragment key={`${item.date}-${index}`}>
                        <List.Item
                            title={`${DateTime.fromISO(event.start).toLocaleString(DateTime.TIME_SIMPLE)} – ${DateTime.fromISO(event.end).toLocaleString(DateTime.TIME_SIMPLE)}`}
                            titleStyle={styles.intervalTitle}
                            description={event.label}
                            descriptionStyle={styles.intervalLabel}
                            // 'Schedule' mode events are tappable if they carry a location
                            onPress={props.mode === 'schedule' && event.location
                                ? () => setSelectedEvent(event)
                                : undefined
                            }
                            left={p => (
                                <List.Icon
                                    {...p}
                                    icon={event.icon}
                                    color={theme.colors.primary}
                                />
                            )}
                            // Chevron signals tappability in schedule mode
                            right={props.mode === 'schedule' && event.location
                                ? p => <List.Icon {...p} icon="chevron-right" color={theme.colors.primary}/>
                                : undefined
                            }
                        />
                        {index < item.events.length - 1 && <Divider />}
                    </React.Fragment>
                ))}
            </Surface>
        </View>
    );

    return (
        <>
            <View style={{height: dynamicHeight}}>
                <FlatList
                    data={groups}
                    keyExtractor={item => item.date}
                    renderItem={renderGroup}
                    contentContainerStyle={styles.list}
                    nestedScrollEnabled={true}
                />
            </View>

            {/* Map modal — only reachable in schedule mode since overlap events
                have no location field and therefore no onPress handler.
                Portal renders the modal above all other content in the tree.

                The map is intentionally non-interactive (scrollEnabled/zoomEnabled false)
                to prevent it from capturing scroll gestures inside the modal, while still
                giving the user enough spatial context to identify the location. */}
            <Portal>
                <Modal
                    visible={!!selectedEvent}
                    onDismiss={() => setSelectedEvent(null)}
                    contentContainerStyle={styles.modal}
                >
                    {selectedEvent?.location && (
                        <>
                            <Text variant="titleMedium" style={styles.modalTitle}>
                                {`${DateTime.fromISO(selectedEvent.start).toLocaleString(DateTime.TIME_SIMPLE)} – ${DateTime.fromISO(selectedEvent.end).toLocaleString(DateTime.TIME_SIMPLE)}`}
                            </Text>
                            <Text variant="bodySmall" style={styles.modalSubtitle}>
                                {selectedEvent.label}
                            </Text>

                            <View>
                                {/* GeoJSON coordinates are [longitude, latitude] */}
                                <MapView
                                    provider={Platform.OS === 'android' ? 'google' : undefined}
                                    style={styles.map}
                                    initialRegion={{
                                        latitude: selectedEvent.location.coordinates[1],
                                        longitude: selectedEvent.location.coordinates[0],
                                        latitudeDelta: 0.02,  // ~2km zoom — shows street names
                                        longitudeDelta: 0.02,
                                    }}
                                    scrollEnabled={false}
                                    zoomEnabled={false}
                                />
                                
                                {/* Absolutely positioned pin overlay - same approach as LocationPicker */}
                                <View style={styles.pinOverlay} pointerEvents="none">
                                    <View style={styles.markerHead} />
                                    <View style={styles.markerStem} />
                                </View>
                            </View>

                            <Button
                                mode="contained"
                                onPress={() => setSelectedEvent(null)}
                                style={styles.closeButton}
                            >
                                Close
                            </Button>
                        </>
                    )}
                </Modal>
            </Portal>
        </>
    );
};

export const MIN_CALENDAR_HEIGHT = 120;
export const MAX_CALENDAR_HEIGHT = 400;

const MAP_HEIGHT = 300;
const PIN_HEAD_SIZE = 24;
const PIN_STEM_HEIGHT = 16;

const styles = StyleSheet.create({
    list: {padding: spacing.lg, gap: spacing.xl},
    emptyContainer: {padding: 40, alignItems: 'center', height: MIN_CALENDAR_HEIGHT},
    emptyText: {...commonStyles.mutedText, textAlign: 'center'},
    daySection: {gap: spacing.sm},
    dayHeader: {
        paddingLeft: spacing.sm,
        ...commonStyles.upperLabel,
    },
    surface: {borderRadius: 12, overflow: 'hidden', backgroundColor: theme.colors.tertiaryContainer, borderColor: theme.colors.tertiary},
    intervalTitle: {fontWeight: 'bold'},
    intervalLabel: {color: theme.colors.primary, opacity: 0.6},
    modal: {
        backgroundColor: 'white',
        margin: spacing.xxl,
        borderRadius: 12,
        overflow: 'hidden',
    },
    modalTitle: {fontWeight: 'bold', padding: spacing.lg, paddingBottom: spacing.xs},
    modalSubtitle: {opacity: 0.6, paddingHorizontal: spacing.lg, paddingBottom: spacing.md},
    map: {width: '100%', height: MAP_HEIGHT},
    pinOverlay: {
        position: 'absolute',
        top: MAP_HEIGHT / 2 - PIN_HEAD_SIZE - PIN_STEM_HEIGHT,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    closeButton: {margin: spacing.lg},
    markerHead: {
        width: PIN_HEAD_SIZE,
        height: PIN_HEAD_SIZE,
        borderRadius: PIN_HEAD_SIZE / 2,
        backgroundColor: colors.pin,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    markerStem: {width: 2, height: PIN_STEM_HEIGHT, backgroundColor: colors.pin},
});