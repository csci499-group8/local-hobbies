import React, {useState} from 'react';
import {View, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform} from 'react-native';
import {Text, Button, ProgressBar} from 'react-native-paper';
import {useRouter} from 'expo-router';
import {useAuth} from '@/src/context/AuthContext';
import {useUser} from '@/src/hooks/useUser';
import {UserOnboardingRequest, OnboardingSectionName} from '@/src/types/user';
import {OnboardingNameStep} from '@/src/components/onboarding/OnboardingNameStep';
import {OnboardingBirthDateStep} from '@/src/components/onboarding/OnboardingBirthDateStep';
import {OnboardingLocationStep} from '@/src/components/onboarding/OnboardingLocationStep';
import {OnboardingContactStep} from '@/src/components/onboarding/OnboardingContactStep';
import {OnboardingGenderMatchedStep} from '@/src/components/onboarding/OnboardingGenderMatchedStep';
import {OnboardingPrivacyStep} from '@/src/components/onboarding/OnboardingPrivacyStep';
import {OnboardingHobbiesStep} from '@/src/components/onboarding/OnboardingHobbiesStep';
import {OnboardingAvailabilityStep} from '@/src/components/onboarding/OnboardingAvailabilityStep';
import {OnboardingOverview} from "@/src/components/onboarding/OnboardingOverview";

// Steps in display order — mirrors OnboardingSectionName but as a UI concept
const STEPS = [
    OnboardingSectionName.Name,
    OnboardingSectionName.BirthDate,
    OnboardingSectionName.Location,
    OnboardingSectionName.PublicContactInfo,
    OnboardingSectionName.GenderMatched,
    //showAge and ShowGenderDisplayed are grouped as "Privacy" because the two are too thin for separate steps
    OnboardingSectionName.ShowAge,
    OnboardingSectionName.Hobbies,
    OnboardingSectionName.Availabilities,
] as const;

const STEP_TITLES: Record<typeof STEPS[number], string> = {
    [OnboardingSectionName.Name]: 'What\'s your name?',
    [OnboardingSectionName.BirthDate]: 'When were you born?',
    [OnboardingSectionName.Location]: 'Where are you based?',
    [OnboardingSectionName.PublicContactInfo]: 'How can people reach you?',
    [OnboardingSectionName.GenderMatched]: 'Who do you want to meet?',
    [OnboardingSectionName.ShowAge]: 'Privacy settings',
    [OnboardingSectionName.Hobbies]: 'What are your hobbies?',
    [OnboardingSectionName.Availabilities]: 'When are you free?',
};

export default function OnboardingScreen() {
    const router = useRouter();
    const {onLogin} = useAuth();
    const {completeOnboarding, onboardingStatus} = useUser();
    const [stepIndex, setStepIndex] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showOverview, setShowOverview] = useState(true);
    // Accumulated onboarding data across all steps
    const [draft, setDraft] = useState<UserOnboardingRequest>({});

    const currentStep = STEPS[stepIndex];
    const progress = (stepIndex + 1) / STEPS.length;
    const isLastStep = stepIndex === STEPS.length - 1;

    const handleStepComplete = (updates: Partial<UserOnboardingRequest>) => {
        const updated = {...draft, ...updates};
        setDraft(updated);

        if (isLastStep) {
            handleSubmit(updated);
        } else {
            setStepIndex(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (stepIndex > 0) setStepIndex(prev => prev - 1);
    };

    const handleSubmit = async (finalDraft: UserOnboardingRequest) => {
        setIsSubmitting(true);
        try {
            await completeOnboarding(finalDraft);
            // completeOnboarding returns AuthResponse — navigator reacts to
            // updated onboardingComplete flag in AuthContext
        } catch (e: unknown) {
            Alert.alert(
                'Onboarding Failed',
                e instanceof Error ? e.message : 'An unexpected error occurred'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // Skip steps that are already complete per onboarding status
    // (handles resuming a partially completed onboarding)
    const incompleteSections = new Set(
        onboardingStatus?.incompleteSections.map(s => s.name) ?? []
    );

    // Show overview on first render if onboardingStatus is loaded
    if (showOverview && onboardingStatus) {
        return (
            <ScrollView contentContainerStyle={styles.overviewContainer}>
                <OnboardingOverview
                    incompleteSections={onboardingStatus.incompleteSections}
                    onStart={firstIncompleteIndex => {
                        setStepIndex(firstIncompleteIndex);
                        setShowOverview(false);
                    }}
                />
            </ScrollView>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.screen}>

                {/* Header */}
                <View style={styles.header}>
                    <ProgressBar progress={progress} style={styles.progress} />
                    <Text variant="bodySmall" style={styles.stepCount}>
                        Step {stepIndex + 1} of {STEPS.length}
                    </Text>
                    <Text variant="headlineSmall" style={styles.title}>
                        {STEP_TITLES[currentStep]}
                    </Text>
                </View>

                {/* Step content */}
                <ScrollView
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                >
                    {currentStep === OnboardingSectionName.Name && (
                        <OnboardingNameStep
                            initialValue={draft.name}
                            onComplete={name => handleStepComplete({name})}
                            isSubmitting={isSubmitting}
                        />
                    )}
                    {currentStep === OnboardingSectionName.BirthDate && (
                        <OnboardingBirthDateStep
                            initialValue={draft.birthDate}
                            onComplete={birthDate => handleStepComplete({birthDate})}
                            isSubmitting={isSubmitting}
                        />
                    )}
                    {currentStep === OnboardingSectionName.Location && (
                        <OnboardingLocationStep
                            initialValue={draft.location}
                            onComplete={location => handleStepComplete({location})}
                            isSubmitting={isSubmitting}
                        />
                    )}
                    {currentStep === OnboardingSectionName.PublicContactInfo && (
                        <OnboardingContactStep
                            initialValue={draft.publicContactInfo}
                            onComplete={publicContactInfo => handleStepComplete({publicContactInfo})}
                            isSubmitting={isSubmitting}
                        />
                    )}
                    {currentStep === OnboardingSectionName.GenderMatched && (
                        <OnboardingGenderMatchedStep
                            initialValue={draft.genderMatched}
                            onComplete={genderMatched => handleStepComplete({genderMatched})}
                            isSubmitting={isSubmitting}
                        />
                    )}
                    {currentStep === OnboardingSectionName.ShowAge && (
                        <OnboardingPrivacyStep
                            initialShowAge={draft.showAge}
                            initialShowGenderDisplayed={draft.showGenderDisplayed}
                            onComplete={(showAge, showGenderDisplayed) =>
                                handleStepComplete({showAge, showGenderDisplayed})
                            }
                            isSubmitting={isSubmitting}
                        />
                    )}
                    {currentStep === OnboardingSectionName.Hobbies && (
                        <OnboardingHobbiesStep
                            initialValue={draft.hobbies}
                            onComplete={hobbies => handleStepComplete({hobbies})}
                            isSubmitting={isSubmitting}
                        />
                    )}
                    {currentStep === OnboardingSectionName.Availabilities && (
                        <OnboardingAvailabilityStep
                            initialValue={draft.availabilities}
                            onComplete={availabilities => handleStepComplete({availabilities})}
                            isSubmitting={isSubmitting}
                        />
                    )}
                </ScrollView>

                {/* Back button */}
                {stepIndex > 0 && (
                    <View style={styles.backRow}>
                        <Button
                            mode="text"
                            icon="arrow-left"
                            onPress={handleBack}
                            disabled={isSubmitting}
                        >
                            Back
                        </Button>
                    </View>
                )}

            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    flex: {flex: 1},
    screen: {flex: 1, backgroundColor: '#f8f9fa'},
    header: {padding: 24, paddingBottom: 16, gap: 8, backgroundColor: '#fff'},
    overviewContainer: {flexGrow: 1, padding: 24, justifyContent: 'center', gap: 8},
    progress: {height: 4, borderRadius: 2},
    stepCount: {opacity: 0.5},
    title: {fontWeight: 'bold'},
    content: {padding: 24, paddingBottom: 48, flexGrow: 1},
    backRow: {padding: 16, paddingTop: 0},
});