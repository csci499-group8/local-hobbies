import {MD3LightTheme} from 'react-native-paper';

export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
} as const;

export const colors = {
    // Surfaces
    surface: '#ffffff',
    surfaceVariant: '#f0f2f5',
    surfaceInput: '#e8e8e8',

    // Text
    textPrimary: '#111111',
    textSecondary: '#444444',
    textMuted: '#666666',
    textDisabled: '#999999',

    // Borders
    border: '#cccccc',
    borderStrong: '#999999',

    // Brand
    primary: '#4a0080',
    primaryLight: '#d4aaff',
    onPrimary: '#ffffff',

    tertiary: '#fdb177',
    tertiaryLight: '#ffedd9ff',
    onTertiary: '#111111',
    tertiaryContainer: '#fbd9b3',
    onTertiaryContainer: '#552a00',

    // Semantic
    error: '#b00020',
    cancelled: '#f5c0c0',
    overlapping: '#c8a0e8',

    // Map pin
    pin: '#4a0080',

    // Cards
    cardBackground: '#ffffff',
    cardBorder: '#dddddd',
} as const;

// Colors — extends Paper's MD3 theme so useTheme() picks them up
export const theme = {
    ...MD3LightTheme,
    // custom: true,
    colors: {
        ...MD3LightTheme.colors,
        primary: colors.primary,
        onPrimary: colors.onPrimary,
        tertiary: colors.tertiary,
        tertiaryLight: colors.tertiaryLight,
        onTertiary: colors.onTertiary,
        tertiaryContainer: colors.tertiaryContainer,
        onTertiaryContainer: colors.onTertiaryContainer,
        error: colors.error,
        cancelled: colors.cancelled,
        surface: colors.surface,
        surfaceVariant: colors.surfaceVariant,
        surfaceInput: colors.surfaceInput,
        outline: colors.borderStrong,
        overlapping: colors.overlapping
    },

};

export const commonStyles = {
    card: {
        backgroundColor: colors.cardBackground,
    },
    sectionTitle: {
        fontWeight: 'bold' as const,
        color: colors.textPrimary,
        fontSize: 16,
    },
    bodyText: {
        lineHeight: 22,
        color: colors.textSecondary,
    },
    mutedText: {
        color: colors.textMuted,
        fontStyle: 'italic' as const,
    },
    fieldLabel: {
        color: colors.textSecondary,
        lineHeight: 20,
    },
    upperLabel: {
        color: colors.textMuted,
        textTransform: 'uppercase' as const,
        letterSpacing: 1,
        fontSize: 11,
        fontWeight: '600' as const,
    },
    row: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
    },
    chipRow: {
        flexDirection: 'row' as const,
        flexWrap: 'wrap' as const,
        gap: spacing.sm,
    },
    footer: {
        flexDirection: 'row' as const,
        gap: spacing.md,
        marginTop: spacing.sm,
    },
    footerButton: {
        flex: 1,
    },
    pickerBorder: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        overflow: 'hidden' as const,
    },
    section: {
        paddingHorizontal: spacing.xxl,
        paddingVertical: spacing.lg,
        gap: spacing.sm,
    },
    centered: {
        flex: 1,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
    },
} as const;