import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Card, Text, useTheme} from 'react-native-paper';
import {spacing, theme} from '@/src/theme';
import {MaterialCommunityIcons} from "@expo/vector-icons";

interface Props {
    contactInfo: string;
}

export const ProfileContactInfo = ({ contactInfo }: Props) => {
    const theme = useTheme();

    return (
        <Card style={styles.contactCard} mode="contained">
            <Card.Content style={styles.content}>
                <MaterialCommunityIcons
                    name="contacts"
                    size={20}
                    color={theme.colors.primary}
                    style={styles.icon}
                />
                <View style={styles.textContainer}>
                    <Text variant="labelMedium" style={styles.title}>
                        Contact Information
                    </Text>
                    <Text variant="bodyMedium" style={styles.info}>
                        {contactInfo || 'No contact info provided'}
                    </Text>
                </View>
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    contactCard: {
        alignSelf: 'center',
        width: '80%',
        marginVertical: spacing.sm,
        backgroundColor: theme.colors.tertiaryLight,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: theme.colors.tertiary,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.sm,
        gap: spacing.sm,
    },
    icon: {marginRight: 4},
    textContainer: {alignItems: 'flex-start'},
    title: {opacity: 0.6, textTransform: 'uppercase', fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5},
    // info: {fontWeight: '600', color: '#552a00'},
    info: {color: theme.colors.tertiaryDark}
});