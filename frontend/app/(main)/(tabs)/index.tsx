// screens/app/(tabs)/index.tsx
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Appbar, Card, Button, Avatar, Divider, List, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { ActivityIndicator } from 'react-native-paper';
import { useHomepage } from '@/src/hooks/useHomepage';
import { spacing } from '@/src/theme';

export default function HomeScreen() {
    const router = useRouter();
    const theme = useTheme();

    const { homepageData, homepageLoading, homepageError } = useHomepage();

    if (homepageLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (homepageError || !homepageData) {
        return (
            <View style={styles.centered}>
                <Text variant="bodyLarge">Error loading homepage: {homepageError}</Text>
            </View>
        );
    }

    const { user, hobbySummary, matchSummary } = homepageData;

    return (
        <View style={styles.screen}>
            <Appbar.Header elevated>
                <Appbar.Content title="Local Hobbies" />
                {/* Account Settings Link in Header */}
                <Appbar.Action
                    icon="cog"
                    onPress={() => router.push('/settings')}
                    accessibilityLabel="Account Settings"
                />
            </Appbar.Header>

            <ScrollView contentContainerStyle={styles.list}>

                {/* User greeting */}
                <View style={styles.greeting}>
                    {user.profilePhotoUrl ? (
                        <Image
                            source={{uri: user.profilePhotoUrl}}
                            style={styles.profilePhoto}
                            contentFit="cover"
                            transition={200}
                        />
                    ) : (
                        <Avatar.Icon size={64} icon="account" />
                    )}
                    <Text variant="headlineSmall" style={styles.greetingText}>
                        Hello, {user.name}
                    </Text>
                </View>

                <Divider style={styles.divider} />

                {/* Summary cards */}
                <View style={styles.summaryRow}>
                    {/*/!* Hobby Summary *!/*/}
                    {/*<View style={styles.summaryContainer}>*/}
                    {/*    <Card style={styles.summaryCard} mode="outlined">*/}
                    {/*        <Card.Content style={styles.summaryContent}>*/}
                    {/*            <Text variant="displaySmall" style={styles.summaryNumber}>*/}
                    {/*                {hobbySummary.count}*/}
                    {/*            </Text>*/}
                    {/*            <Text variant="bodySmall" style={styles.summaryLabel}>*/}
                    {/*                {hobbySummary.count === 1 ? 'Hobby' : 'Hobbies'}*/}
                    {/*            </Text>*/}
                    {/*        </Card.Content>*/}
                    {/*    </Card>*/}
                    {/*    <Button*/}
                    {/*        mode="text"*/}
                    {/*        compact*/}
                    {/*        onPress={() => router.push('/hobbies')}*/}
                    {/*        contentStyle={{ flexDirection: 'row-reverse' }}*/}
                    {/*        icon="chevron-right"*/}
                    {/*    >*/}
                    {/*        <Text>Manage Hobbies</Text>*/}
                    {/*    </Button>*/}
                    {/*</View>*/}

                    {/*/!* Match Summary *!/*/}

                    <View style={styles.summaryContainer}>
                        <Card style={styles.summaryCard} mode="outlined">
                            <Card.Content style={styles.summaryContent}>
                                <Text variant="displaySmall" style={styles.summaryNumber}>
                                    {matchSummary.inboundMatchCount}
                                </Text>
                                <Text variant="bodySmall" style={styles.summaryLabel}>
                                    {matchSummary.inboundMatchCount === 1
                                        ? 'Person saved you'
                                        : 'People saved you'}
                                </Text>
                            </Card.Content>
                        </Card>
                        <Button
                            mode="text"
                            compact
                            onPress={() => router.push('/match-search')}
                            contentStyle={{ flexDirection: 'row-reverse' }}
                            icon="magnify"
                        >
                            <Text>Discover New Matches</Text>
                        </Button>
                    </View>


                    <View style={styles.summaryContainer}>
                        <Card style={styles.summaryCard} mode="outlined">
                            <Card.Content style={styles.summaryContent}>
                                <Text variant="displaySmall" style={styles.summaryNumber}>
                                    {matchSummary.mutualMatchCount}
                                </Text>
                                <Text variant="bodySmall" style={styles.summaryLabel}>
                                    {matchSummary.mutualMatchCount === 0
                                        ? 'Matches are mutual'
                                        : matchSummary.mutualMatchCount === 1
                                            ? 'Match is mutual!'
                                            : 'Matches are mutual!'}
                                </Text>
                            </Card.Content>
                        </Card>
                        <Button
                            mode="text"
                            compact
                            onPress={() => router.push('/(main)/mutual-matches')}
                            contentStyle={{ flexDirection: 'row-reverse' }}
                            icon="bookmark-check"
                        >
                            <Text>View Mutual Matches</Text>
                        </Button>
                    </View>
                </View>

                <Divider style={styles.divider} />

                {/* Quick navigation */}
                <Text variant="titleSmall" style={styles.sectionTitle}>Quick Actions</Text>

                <Card mode="outlined" style={styles.navCard}>
                    {/*<List.Item*/}
                    {/*    title="Discover matches"*/}
                    {/*    description="Search for people who share your hobbies"*/}
                    {/*    left={props => <List.Icon {...props} icon="magnify" />}*/}
                    {/*    right={props => <List.Icon {...props} icon="chevron-right" />}*/}
                    {/*    onPress={() => router.push('/match-search')}*/}
                    {/*/>*/}


                    {/*<Divider />*/}

                    <List.Item
                        title="Manage availabilities"
                        description="Update when you're free to meet up"
                        left={props => <List.Icon {...props} icon="calendar" />}
                        right={props => <List.Icon {...props} icon="chevron-right" />}
                        onPress={() => router.push('/availabilities')}
                    />

                    <Divider />

                    <List.Item
                        title="View profile"
                        description="See how your profile appears to others"
                        left={props => <List.Icon {...props} icon="account-eye" />}
                        right={props => <List.Icon {...props} icon="chevron-right" />}
                        onPress={() => router.push('/me')}
                    />
                </Card>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {flex: 1, backgroundColor: '#f8f9fa'},
    centered: {flex: 1, justifyContent: 'center', alignItems: 'center'},
    list: {padding: 16, gap: 16},
    greeting: {flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 8},
    profilePhoto: {width: 64, height: 64, borderRadius: 32, backgroundColor: '#e0e0e0'},
    greetingText: {flex: 1, gap: 2, fontWeight: 'bold'},
    subtitle: {opacity: 0.6},
    divider: {marginVertical: 4},
    summaryRow: {flexDirection: 'row', gap: 12, alignItems: 'flex-start'},
    summaryCard: {flex: 1, backgroundColor: '#fff'},
    summaryContent: {alignItems: 'center', gap: 4},
    summaryNumber: {fontWeight: 'bold'},
    summaryLabel: {opacity: 0.6, textAlign: 'center'},
    summaryContainer: {flex: 1, gap: 4},
    sectionTitle: {fontWeight: 'bold', opacity: 0.7, textTransform: 'uppercase', letterSpacing: 1},
    navCard: {backgroundColor: '#fff'},
});