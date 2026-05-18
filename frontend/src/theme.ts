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
    background: '#fffaf3',

    // Surfaces
    surface: '#8968af', //original blue: 161
    onSurface: '#4a0080',
    // surfaceVariant: 'rgba(255,237,217,0.35)',
    surfaceVariant: '#fdf3e5',

    // // Text
    // textPrimary: '#111111',
    // textSecondary: '#444444',
    // textMuted: '#666666',
    // textDisabled: '#999999',

    // Borders
    border: '#fdb177',
    borderStrong: '#c85600',

    // Brand
    primary: '#4a0080',
    primaryLight: '#e4cbfd',
    onPrimary: '#ffffff',

    tertiary: '#fdb177',
    tertiaryLight: '#ffedd9',
    tertiaryDark: '#c85600',
    tertiaryContainer: '#fdd9b6',

    // Semantic
    error: '#b00020',
    cancelled: '#f5c0c0',
    overlapping: '#c8a0e8',

    // Map pin
    pin: '#4a0080',

} as const;

// Colors — extends Paper's MD3 theme so useTheme() picks them up
export const theme = {
    ...MD3LightTheme,
    // custom: true,
    colors: {
        ...MD3LightTheme.colors,
        primary: colors.primary,
        primaryLight: colors.primaryLight,
        onPrimary: colors.onPrimary,
        tertiary: colors.tertiary,
        tertiaryLight: colors.tertiaryLight,
        tertiaryDark: colors.tertiaryDark,
        tertiaryContainer: colors.tertiaryContainer,
        error: colors.error,
        cancelled: colors.cancelled,
        background: colors.background,
        surface: colors.surface,
        onSurface: colors.onSurface,
        surfaceVariant: colors.surfaceVariant,
        outline: colors.border,
        overlapping: colors.overlapping,

    },

};

export const commonStyles = {
    card: {
        backgroundColor: colors.tertiaryLight,
    },
    sectionTitle: {
        fontWeight: 'bold' as const,
        color: colors.primary,
        fontSize: 16,
    },
    bodyText: {
        lineHeight: 22,
        color: colors.primary,
    },
    mutedText: {
        color: colors.primary,
        opacity: 0.6,
        // fontStyle: 'italic' as const,
    },
    fieldLabel: {
        color: colors.tertiaryDark,
        // lineHeight: 20,
    },
    upperLabel: {
        color: colors.primary,
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
    lightBackground: {
        backgroundColor: theme.colors.surfaceVariant
    },
} as const;