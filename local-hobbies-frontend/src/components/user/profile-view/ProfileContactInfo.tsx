import React from 'react';
import {StyleSheet} from 'react-native';
import {Card, List} from 'react-native-paper';

interface Props {
    publicContactInfo: string;
}

export const ProfileContactInfo = ({publicContactInfo}: Props) => (
    <Card style={styles.contactCard} mode="contained">
        <Card.Content>
            <List.Item
                title="Contact Information"
                description={publicContactInfo || 'No contact info provided'}
                left={props => <List.Icon {...props} icon="information" />}
            />
        </Card.Content>
    </Card>
);

const styles = StyleSheet.create({
    contactCard: {
        marginHorizontal: 24,
        marginVertical: 16,
        backgroundColor: '#f8f9fa',
    },
});