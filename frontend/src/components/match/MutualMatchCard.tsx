// Displays a mutual match (both users have saved each other) with matched
// user info, shared hobbies, notes, mutual match date, and actions to view
// profile, edit notes, or remove the match.

import React from 'react';
import {DateTime} from 'luxon';
import {MutualMatchResponse} from '@/src/types/match';
import {BaseMatchCard} from './BaseMatchCard';

interface Props {
    match: MutualMatchResponse;
    onEditNotes: () => void;
    onDelete: () => void;
}

export const MutualMatchCard = ({match, onEditNotes, onDelete}: Props) => (
    <BaseMatchCard
        matchedUser={match.savedUser}
        overlappingHobbies={match.overlappingHobbies}
        notes={match.notes}
        timestampLabel={`Matched since ${DateTime.fromISO(match.mutualMatchTime).toLocaleString(DateTime.DATE_MED)}`}
        contactInfo={match.contactInfo}
        onEditNotes={onEditNotes}
        onDelete={onDelete}
    />
);