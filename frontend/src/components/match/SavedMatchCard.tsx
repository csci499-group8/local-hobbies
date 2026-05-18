// Displays a saved match with matched user info, shared hobbies, notes,
// save date, and actions to view profile, edit notes, or remove the match.

import React from 'react';
import {DateTime} from 'luxon';
import {SavedMatchResponse} from '@/src/types/match';
import {BaseMatchCard} from './BaseMatchCard';
//TODO: no style?

interface Props {
    match: SavedMatchResponse;
    onEditNotes: () => void;
    onDelete: () => void;
}

export const SavedMatchCard = ({match, onEditNotes, onDelete}: Props) => (
    <BaseMatchCard
        matchedUser={match.savedUser}
        overlappingHobbies={match.overlappingHobbies}
        notes={match.notes}
        timestampLabel={`Saved on ${DateTime.fromISO(match.creationTime).toLocaleString(DateTime.DATE_MED)}`}
        onEditNotes={onEditNotes}
        onDelete={onDelete}
    />
);