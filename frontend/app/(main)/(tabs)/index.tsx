import React from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Text, Appbar, Card, Divider, List } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { ActivityIndicator } from 'react-native-paper';
import { useHomepage } from '@/src/hooks/useHomepage';
import {spacing, theme} from '@/src/theme';

export default function HomeScreen() {
    const router = useRouter();

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

    const profilePhotoUrl = user.profilePhotoUrl
        ? user.profilePhotoUrl
        : "https://placehold.net/avatar.png";

    return (
        <View style={styles.screen}>
            <Appbar.Header>
                <Appbar.Content title="Local Hobbies" />
                {/* Account Settings Link in Header */}
                <Appbar.Action
                    icon="cog"
                    color={theme.colors.primary}
                    onPress={() => router.push('/settings')}
                    accessibilityLabel="Account Settings"
                />
            </Appbar.Header>

            <ScrollView contentContainerStyle={styles.list}>

                {/* User greeting */}
                <View style={styles.greeting}>
                    <Image
                        source={{uri: profilePhotoUrl}}
                        style={styles.profilePhoto}
                        contentFit="cover"
                        transition={200}
                    />
                    <Text variant="headlineSmall" style={styles.greetingText}>
                        Hello, {user.name}
                    </Text>
                </View>

                <Divider style={styles.divider} />

                {/* Summary cards */}
                <View style={styles.summaryRow}>

                    {/* Inbound match summary*/}
                    <View style={styles.summaryContainer}>
                        <Card style={styles.summaryCard} mode="contained">
                            <Card.Content style={styles.summaryContent}>
                                <Text variant="displaySmall" style={styles.summaryNumber}>
                                    {matchSummary.inboundMatchCount}
                                </Text>
                                <Text style={styles.summaryLabel}>
                                    {matchSummary.inboundMatchCount === 0
                                        ? 'People saved you'
                                        : matchSummary.inboundMatchCount === 1
                                            ? 'Person saved you!'
                                            : 'People saved you!'}
                                </Text>
                            </Card.Content>
                        </Card>
                        <Pressable
                            onPress={() => router.push('/(main)/match-search')}
                            style={({ pressed }) => [
                                styles.customButton,
                                { backgroundColor: theme.colors.tertiary, opacity: pressed ? 0.7 : 1 }
                            ]}
                        >
                            <List.Icon icon="magnify" color={theme.colors.primary} style={styles.buttonIcon} />
                            <Text style={styles.buttonLabel}>
                                Discover{'\n'}New Matches
                            </Text>
                        </Pressable>
                    </View>

                    {/* Mutual match summary*/}
                    <View style={styles.summaryContainer}>
                        <Card style={styles.summaryCard} mode="contained">
                            <Card.Content style={styles.summaryContent}>
                                <Text variant="displaySmall" style={styles.summaryNumber}>
                                    {matchSummary.mutualMatchCount}
                                </Text>
                                <Text style={styles.summaryLabel}>
                                    {matchSummary.mutualMatchCount === 0
                                        ? 'Matches are mutual'
                                        : matchSummary.mutualMatchCount === 1
                                            ? 'Match is mutual!'
                                            : 'Matches are mutual!'}
                                </Text>
                            </Card.Content>
                        </Card>
                        <Pressable
                            onPress={() => router.push('/(main)/mutual-matches')}
                            style={({ pressed }) => [
                                styles.customButton,
                                { backgroundColor: theme.colors.tertiary, opacity: pressed ? 0.7 : 1 }
                            ]}
                        >
                            <List.Icon icon="bookmark-check" color={theme.colors.primary} style={styles.buttonIcon} />
                            <Text style={styles.buttonLabel}>
                                View Mutual{'\n'}Matches
                            </Text>
                        </Pressable>
                    </View>
                </View>

                <Divider style={styles.divider} />

                {/* Quick navigation */}
                <Text variant="titleSmall" style={styles.sectionTitle}>Quick Actions</Text>

                <Card mode="outlined" style={styles.navCard}>
                    <List.Item
                        title="View profile"
                        description="See how your profile appears to others"
                        descriptionStyle={{ color: theme.colors.tertiaryDark }}
                        left={props => <List.Icon {...props} icon="account-eye" color={theme.colors.primary} />}
                        right={props => <List.Icon {...props} icon="chevron-right" color={theme.colors.primary} />}
                        onPress={() => router.push('/me')}
                    />

                    <Divider />

                    <List.Item
                        title="Manage hobby photos"
                        description="Update photos relating to your hobbies"
                        descriptionStyle={{ color: theme.colors.tertiaryDark }}
                        left={props => <List.Icon {...props} icon="camera" color={theme.colors.primary} />}
                        right={props => <List.Icon {...props} icon="chevron-right" color={theme.colors.primary} />}
                        onPress={() => router.push('/hobbies/photos')}
                    />
                </Card>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {flex: 1},
    centered: {flex: 1, justifyContent: 'center', alignItems: 'center'},
    list: {padding: 16, gap: 16},
    greeting: {flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 8},
    profilePhoto: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderColor: theme.colors.tertiary,
        borderWidth: 3,
    },
    greetingText: {flex: 1, gap: 2, fontWeight: 'bold'},
    subtitle: {opacity: 0.6},
    divider: {marginVertical: 4},
    summaryRow: {flexDirection: 'row', gap: 12, alignItems: 'flex-start'},
    summaryCard: {flex: 1, backgroundColor: theme.colors.background}, //borderRadius: 20,
    summaryContent: {alignItems: 'center', gap: 4},
    summaryNumber: {fontWeight: 'bold'},
    summaryLabel: {color: theme.colors.tertiaryDark, textAlign: 'center'},
    summaryContainer: {flex: 1, gap: 4},
    actionButton: {marginTop: 4},
    sectionTitle: {fontWeight: 'bold', opacity: 0.7, textTransform: 'uppercase', letterSpacing: 1},
    navCard: {backgroundColor: theme.colors.tertiaryLight, borderColor: theme.colors.tertiary},
    customButton: {
        marginTop: 4,
        height: 56,
        borderRadius: 28,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
    },
    buttonIcon: {margin: 0, marginRight: 8, width: 24, height: 24},
    buttonLabel: {
        color: theme.colors.primary,
        textAlign: 'center',
        fontSize: 13,
        fontWeight: '500',
        lineHeight: 16,
        marginRight: 4
    },
});