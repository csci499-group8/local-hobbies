import React, {useState} from 'react';
import {View, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform} from 'react-native';
import {Text, Button, ProgressBar, ActivityIndicator} from 'react-native-paper';
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
import {useOnboarding} from "@/src/hooks/useOnboarding";
import {useAuth} from "@/src/context/AuthContext";

// Steps in display order — mirrors OnboardingSectionName but as a UI concept
const STEPS = [
    OnboardingSectionName.Name,
    OnboardingSectionName.BirthDate,
    OnboardingSectionName.Location,
    OnboardingSectionName.ContactInfo,
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
    [OnboardingSectionName.ContactInfo]: 'How can people reach you?',
    [OnboardingSectionName.GenderMatched]: 'What gender do you want to use in searches?',
    [OnboardingSectionName.ShowAge]: 'Privacy settings',
    [OnboardingSectionName.Hobbies]: 'What are your hobbies?',
    [OnboardingSectionName.Availabilities]: 'When are you free?',
};

export default function OnboardingScreen() {
    const {completeOnboarding, onboardingStatus, onboardingStatusLoading} = useOnboarding();
    const { updateAfterOnboarding } = useAuth();
    const [stepIndex, setStepIndex] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showOverview, setShowOverview] = useState(true);
    // Accumulated onboarding data across all steps
    const [draft, setDraft] = useState<UserOnboardingRequest>({});

    const currentStep = STEPS[stepIndex];
    const progress = (stepIndex + 1) / STEPS.length;
    const isLastStep = stepIndex === STEPS.length - 1;

    const handleStepComplete = (updates: Partial<UserOnboardingRequest>) => {
        try {
            const updated = {...draft, ...updates};
            console.log('Step complete, updated draft:', JSON.stringify(updated, null, 2));

            setDraft(updated);

            if (isLastStep) {
                handleSubmit(updated);
            } else {
                setStepIndex(prev => prev + 1);
            }
        } catch (e: unknown) {
            console.log('handleStepComplete error:', e);
        }
    };

    const handleBack = () => {
        if (stepIndex > 0) setStepIndex(prev => prev - 1);
    };

    const handleSubmit = async (finalDraft: UserOnboardingRequest) => {
        setIsSubmitting(true);
        try {
            const response = await completeOnboarding(finalDraft);
            await updateAfterOnboarding(response);
            // Root navigator reacts to user.onboardingComplete becoming true
            console.log('Onboarding complete');
        } catch (e: unknown) {
            console.log('Onboarding submission error:', e);
            console.log('Error message:', e instanceof Error ? e.message : 'unknown');
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

    //show loading screen while onboarding status is determined
    if (showOverview && onboardingStatusLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

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
            style={styles.screen}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
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
                    {currentStep === OnboardingSectionName.ContactInfo && (
                        <OnboardingContactStep
                            initialValue={draft.contactInfo}
                            onComplete={contactInfo => handleStepComplete({contactInfo})}
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
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    screen: {flex: 1},
    header: {padding: 24, paddingBottom: 16, gap: 8},
    overviewContainer: {flexGrow: 1, padding: 24, justifyContent: 'center', gap: 8},
    progress: {height: 4, borderRadius: 2},
    stepCount: {opacity: 0.5},
    title: {fontWeight: 'bold'},
    content: {padding: 24, paddingBottom: 48, flexGrow: 1},
    backRow: {padding: 16, paddingTop: 0},
    loadingContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
});