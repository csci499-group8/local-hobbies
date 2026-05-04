// Search form for discovering matches. Required fields: hobby, radius,
// minimum overlap. Optional polymorphic filters with isHard toggle.

import React, {useState, useEffect, useRef} from 'react';
import {View, StyleSheet, TextInput as RNTextInput} from 'react-native';
import {Button, Text, TextInput, HelperText, Chip, Switch, Divider} from 'react-native-paper';
import {useForm, Controller} from 'react-hook-form';
import {Picker} from '@react-native-picker/picker';
import {MatchSearchRequest, MatchSearchFilter} from '@/src/types/match';
import {GlobalHobbyResponse, HobbyExperienceLevel} from '@/src/types/hobby';
import {UserGenderMatched} from '@/src/types/user';

type FormValues = {
    hobby: string;
    radiusKilometers: string;
    minimumOverlapMinutes: string;
};

interface Props {
    globalHobbies: GlobalHobbyResponse[];
    globalHobbiesLoading: boolean;
    onSubmit: (request: MatchSearchRequest) => Promise<void>;
    isSearching: boolean;
}

export const MatchSearchForm = ({globalHobbies, globalHobbiesLoading, onSubmit, isSearching}: Props) => {
    // Filters are managed outside React Hook Form since they're
    // polymorphic and conditionally included
    const [selectedGenders, setSelectedGenders] = useState<UserGenderMatched[]>([]);
    const [gendersIsHard, setGendersIsHard] = useState(false);
    const [minAge, setMinAge] = useState('');
    const [minAgeIsHard, setMinAgeIsHard] = useState(false);
    const [maxAge, setMaxAge] = useState('');
    const [maxAgeIsHard, setMaxAgeIsHard] = useState(false);
    const [experienceLevel, setExperienceLevel] = useState<HobbyExperienceLevel | null>(null);
    const [experienceLevelIsHard, setExperienceLevelIsHard] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Refs for focus management between sequential text inputs
    const overlapRef = useRef<RNTextInput>(null);

    const {control, handleSubmit, reset, formState: {errors}} = useForm<FormValues>({
        defaultValues: {
            hobby: '',
            radiusKilometers: '25',
            minimumOverlapMinutes: '60',
        },
    });

    // Reset hobby default once globalHobbies loads — useForm defaultValues
    // only runs on mount, so if data arrives late the picker would stay empty
    useEffect(() => {
        if (globalHobbies.length > 0) {
            reset((prev) => ({
                ...prev,
                hobby: prev.hobby || globalHobbies[0].name,
            }));
        }
    }, [globalHobbies, reset]);

    const toggleGender = (gender: UserGenderMatched) => {
        setSelectedGenders(prev =>
            prev.includes(gender) ? prev.filter(g => g !== gender) : [...prev, gender]
        );
    };

    const buildFilters = (): MatchSearchFilter[] => {
        const filters: MatchSearchFilter[] = [];

        if (selectedGenders.length > 0) {
            filters.push({type: 'Genders', genders: selectedGenders, isHard: gendersIsHard});
        }
        if (minAge) {
            filters.push({type: 'Minimum age', minAge: parseInt(minAge), isHard: minAgeIsHard});
        }
        if (maxAge) {
            filters.push({type: 'Maximum age', maxAge: parseInt(maxAge), isHard: maxAgeIsHard});
        }
        if (experienceLevel) {
            filters.push({type: 'Experience level', experienceLevel, isHard: experienceLevelIsHard});
        }

        return filters;
    };

    const handleFormSubmit = (values: FormValues) => {
        onSubmit({
            hobby: values.hobby,
            radiusKilometers: parseFloat(values.radiusKilometers),
            minimumOverlapMinutes: parseInt(values.minimumOverlapMinutes),
            filters: buildFilters(),
        });
    };

    return (
        <View style={styles.container}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Find Matches</Text>

            {/* Hobby */}
            <Controller
                control={control}
                name="hobby"
                rules={{required: 'Please select a hobby'}}
                render={({field: {onChange, value}}) => (
                    <View style={styles.field}>
                        <Text variant="labelLarge">Hobby</Text>
                        <View style={styles.pickerBorder}>
                            <Picker
                                selectedValue={value}
                                onValueChange={onChange}
                                enabled={!globalHobbiesLoading && !isSearching}
                            >
                                {globalHobbies.map(h => (
                                    <Picker.Item
                                        key={h.name}
                                        label={`${h.name} (${h.category})`}
                                        value={h.name}
                                    />
                                ))}
                            </Picker>
                        </View>
                        {errors.hobby && (
                            <HelperText type="error">{errors.hobby.message}</HelperText>
                        )}
                    </View>
                )}
            />

            {/* Radius
                returnKeyType moves focus to overlap field */}
            <Controller
                control={control}
                name="radiusKilometers"
                rules={{
                    required: 'Radius is required',
                    pattern: {value: /^\d+(\.\d+)?$/, message: 'Enter a valid number'},
                }}
                render={({field: {onChange, value}}) => (
                    <View style={styles.field}>
                        <TextInput
                            label="Search radius (km)"
                            value={value}
                            onChangeText={onChange}
                            mode="outlined"
                            keyboardType="decimal-pad"
                            disabled={isSearching}
                            error={!!errors.radiusKilometers}
                            returnKeyType="next"
                            onSubmitEditing={() => overlapRef.current?.focus()}
                        />
                        {errors.radiusKilometers && (
                            <HelperText type="error">{errors.radiusKilometers.message}</HelperText>
                        )}
                    </View>
                )}
            />

            {/* Minimum overlap */}
            <Controller
                control={control}
                name="minimumOverlapMinutes"
                rules={{
                    required: 'Minimum overlap is required',
                    pattern: {value: /^\d+$/, message: 'Enter a whole number of minutes'},
                }}
                render={({field: {onChange, value}}) => (
                    <View style={styles.field}>
                        <TextInput
                            label="Minimum overlap (minutes)"
                            value={value}
                            onChangeText={onChange}
                            mode="outlined"
                            keyboardType="number-pad"
                            disabled={isSearching}
                            error={!!errors.minimumOverlapMinutes}
                            ref={overlapRef}
                            returnKeyType="done"
                        />
                        {errors.minimumOverlapMinutes && (
                            <HelperText type="error">{errors.minimumOverlapMinutes.message}</HelperText>
                        )}
                    </View>
                )}
            />

            {/* Filters toggle */}
            <Button
                mode="text"
                icon={showFilters ? 'chevron-up' : 'chevron-down'}
                onPress={() => setShowFilters(prev => !prev)}
                style={styles.filtersToggle}
            >
                {showFilters ? 'Hide filters' : 'Show filters'}
            </Button>

            {showFilters && (
                <View style={styles.filters}>
                    <Divider style={styles.divider} />

                    {/* isHard explanation */}
                    <Text variant="bodySmall" style={styles.filterNote}>
                        "Required" filters exclude results that don't match.
                        Optional filters only affect ranking.
                    </Text>

                    {/* Genders filter */}
                    <View style={styles.field}>
                        <Text variant="labelLarge">Gender preference</Text>
                        <View style={styles.chipRow}>
                            {Object.values(UserGenderMatched).map(gender => (
                                <Chip
                                    key={gender}
                                    selected={selectedGenders.includes(gender)}
                                    onPress={() => toggleGender(gender)}
                                    style={styles.chip}
                                    compact
                                >
                                    {gender}
                                </Chip>
                            ))}
                        </View>
                        {selectedGenders.length > 0 && (
                            <View style={styles.hardRow}>
                                <Text variant="bodySmall">Required</Text>
                                <Switch
                                    value={gendersIsHard}
                                    onValueChange={setGendersIsHard}
                                />
                            </View>
                        )}
                    </View>

                    {/* Min age filter */}
                    <View style={styles.field}>
                        <TextInput
                            label="Minimum age"
                            value={minAge}
                            onChangeText={setMinAge}
                            mode="outlined"
                            keyboardType="number-pad"
                            disabled={isSearching}
                        />
                        {minAge !== '' && (
                            <View style={styles.hardRow}>
                                <Text variant="bodySmall">Required</Text>
                                <Switch
                                    value={minAgeIsHard}
                                    onValueChange={setMinAgeIsHard}
                                />
                            </View>
                        )}
                    </View>

                    {/* Max age filter */}
                    <View style={styles.field}>
                        <TextInput
                            label="Maximum age"
                            value={maxAge}
                            onChangeText={setMaxAge}
                            mode="outlined"
                            keyboardType="number-pad"
                            disabled={isSearching}
                        />
                        {maxAge !== '' && (
                            <View style={styles.hardRow}>
                                <Text variant="bodySmall">Required</Text>
                                <Switch
                                    value={maxAgeIsHard}
                                    onValueChange={setMaxAgeIsHard}
                                />
                            </View>
                        )}
                    </View>

                    {/* Experience level filter */}
                    <View style={styles.field}>
                        <Text variant="labelLarge">Experience level</Text>
                        <View style={styles.chipRow}>
                            {Object.values(HobbyExperienceLevel).map(level => (
                                <Chip
                                    key={level}
                                    selected={experienceLevel === level}
                                    onPress={() => setExperienceLevel(
                                        prev => prev === level ? null : level
                                    )}
                                    style={styles.chip}
                                    compact
                                >
                                    {level}
                                </Chip>
                            ))}
                        </View>
                        {experienceLevel && (
                            <View style={styles.hardRow}>
                                <Text variant="bodySmall">Required</Text>
                                <Switch
                                    value={experienceLevelIsHard}
                                    onValueChange={setExperienceLevelIsHard}
                                />
                            </View>
                        )}
                    </View>
                </View>
            )}

            <Button
                mode="contained"
                icon="magnify"
                onPress={handleSubmit(handleFormSubmit)}
                loading={isSearching}
                disabled={isSearching || globalHobbiesLoading}
                style={styles.searchButton}
            >
                Search
            </Button>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {gap: 12},
    sectionTitle: {fontWeight: 'bold'},
    field: {gap: 4},
    pickerBorder: {borderWidth: 1, borderColor: '#ccc', borderRadius: 8, overflow: 'hidden'},
    filtersToggle: {alignSelf: 'flex-start'},
    filters: {gap: 12},
    divider: {marginVertical: 4},
    filterNote: {opacity: 0.6, fontStyle: 'italic'},
    chipRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
    chip: {backgroundColor: '#f0f0f0'},
    hardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
    },
    searchButton: {marginTop: 8},
});