// Manages location state for forms that include a GeoJsonPoint field.

import {useState} from 'react';
import {GeoJsonPoint} from '@/src/types/common';

interface LocationField {
    location: GeoJsonPoint | null;
    address: string | null;
    showPicker: boolean;
    openPicker: () => void;
    closePicker: () => void;
    handleConfirm: (location: GeoJsonPoint, address: string) => void;
    clearLocation: () => void;
}

export const useLocationField = (
    initialLocation?: GeoJsonPoint,
    initialAddress?: string
): LocationField => {
    const [location, setLocation] = useState<GeoJsonPoint | null>(initialLocation ?? null);
    const [address, setAddress] = useState<string | null>(initialAddress ?? null);
    const [showPicker, setShowPicker] = useState(false);

    return {
        location,
        address,
        showPicker,
        openPicker: () => setShowPicker(true),
        closePicker: () => setShowPicker(false),
        handleConfirm: (loc, addr) => {
            setLocation(loc);
            setAddress(addr);
            setShowPicker(false);
        },
        clearLocation: () => {
            setLocation(null);
            setAddress(null);
        },
    };
};