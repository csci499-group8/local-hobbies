import React, {useMemo, useState} from 'react';
import {FlatList, Platform, StyleSheet, View} from 'react-native';
import {Button, Divider, List, Modal, Portal, Surface, Text, useTheme} from 'react-native-paper';
import MapView, {Marker} from 'react-native-maps';
import {DateTime} from 'luxon';
import {AvailabilityIntervalResponse, AvailabilityOverlapResponse} from '@/src/types/availability';
import {GeoJsonPoint} from '@/src/types/common';

// This component accepts either AvailabilityIntervalResponse (user's own schedule) or
// AvailabilityOverlapResponse (user's overlap with another user) via a discriminated
// union prop type. The `mode` field acts as the discriminator, giving TypeScript the
// ability to enforce that the correct interval type is passed for each mode. In schedule
// mode, tapping a List.Item opens a map view centered on the event's GeoJsonPoint.
type Props =
    | {mode: 'schedule'; intervals: AvailabilityIntervalResponse[]}
    | {mode: 'overlap'; intervals: AvailabilityOverlapResponse[]};

// Normalized internal shape. `location` field is used depending on mode.
interface DayEvent {
    start: string;
    end: string;
    label: string;
    location?: GeoJsonPoint;
}

// FlatList data unit: one group per calendar date
interface DayGroup {
    date: string;
    events: DayEvent[];
}

// Intervals are normalized from API response types into a shared DayEvent shape
// before any grouping or rendering occurs. This decouples the UI from the API.
const normalizeIntervals = (props: Props): DayEvent[] => {
    if (props.mode === 'schedule') {
        return props.intervals.map(i => ({
            start: i.start,
            end: i.end,
            label: i.sourceType,
            location: i.location,
        }));
    }
    return props.intervals.map(i => ({
        start: i.start,
        end: i.end,
        label: `Approx. ${i.distanceKilometers.toFixed(1)} km away`,
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
                            title={`${DateTime.fromISO(event.start).toLocaleString(DateTime.TIME_SIMPLE)} 
                                – ${DateTime.fromISO(event.end).toLocaleString(DateTime.TIME_SIMPLE)}`}
                            description={event.label}
                            // 'Schedule' mode events are tappable if they carry a location
                            onPress={props.mode === 'schedule' && event.location
                                ? () => setSelectedEvent(event)
                                : undefined
                            }
                            left={p => (
                                <List.Icon
                                    {...p}
                                    icon={props.mode === 'overlap' ? 'account-group' : 'calendar-clock'}
                                    color={props.mode === 'overlap' ? theme.colors.primary : theme.colors.secondary}
                                />
                            )}
                            // Chevron signals tappability in schedule mode
                            right={props.mode === 'schedule' && event.location
                                ? p => <List.Icon {...p} icon="chevron-right" />
                                : undefined
                            }
                            titleStyle={styles.intervalTitle}
                        />
                        {index < item.events.length - 1 && <Divider />}
                    </React.Fragment>
                ))}
            </Surface>
        </View>
    );

    return (
        <>
            <FlatList
                data={groups}
                keyExtractor={item => item.date}
                renderItem={renderGroup}
                contentContainerStyle={styles.list}
            />

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
                                {`${DateTime.fromISO(selectedEvent.start).toLocaleString(DateTime.TIME_SIMPLE)} 
                                    – ${DateTime.fromISO(selectedEvent.end).toLocaleString(DateTime.TIME_SIMPLE)}`}
                            </Text>
                            <Text variant="bodySmall" style={styles.modalSubtitle}>
                                {selectedEvent.label}
                            </Text>

                            {/* GeoJSON coordinates are [longitude, latitude] */}
                            <MapView
                                provider={Platform.OS === 'android' ? 'google' : undefined}
                                style={styles.map}
                                initialRegion={{
                                    latitude: selectedEvent.location.coordinates[1],
                                    longitude: selectedEvent.location.coordinates[0],
                                    latitudeDelta: 0.01,  // ~1km neighborhood zoom
                                    longitudeDelta: 0.01,
                                }}
                                scrollEnabled={false}
                                zoomEnabled={false}
                            >
                                <Marker
                                    coordinate={{
                                        latitude: selectedEvent.location.coordinates[1],
                                        longitude: selectedEvent.location.coordinates[0],
                                    }}
                                />
                            </MapView>

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

const styles = StyleSheet.create({
    list: {padding: 16, gap: 20},
    emptyContainer: {padding: 40, alignItems: 'center'},
    emptyText: {opacity: 0.5, fontStyle: 'italic', textAlign: 'center'},
    daySection: {gap: 8},
    dayHeader: {
        paddingLeft: 8,
        opacity: 0.7,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    // overflow: 'hidden' clips List.Item touch ripples to the rounded corners
    surface: {borderRadius: 12, overflow: 'hidden'},
    intervalTitle: {fontWeight: 'bold'},
    modal: {
        backgroundColor: 'white',
        margin: 24,
        borderRadius: 12,
        overflow: 'hidden',
    },
    modalTitle: {fontWeight: 'bold', padding: 16, paddingBottom: 4},
    modalSubtitle: {opacity: 0.6, paddingHorizontal: 16, paddingBottom: 12},
    map: {width: '100%', height: 300},
    closeButton: {margin: 16},
});