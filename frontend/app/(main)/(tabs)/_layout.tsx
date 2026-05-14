import {Tabs} from 'expo-router';
import {useTheme} from 'react-native-paper';
import {MaterialCommunityIcons} from '@expo/vector-icons';

export default function TabsLayout() {
    const theme = useTheme();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: theme.colors.primary,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({color, size}) => (
                        <MaterialCommunityIcons name="home" color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="hobbies"
                options={{
                    title: 'Hobbies',
                    tabBarIcon: ({color, size}) => (
                        <MaterialCommunityIcons name="palette" color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="match-search"
                options={{
                    title: 'Discover',
                    tabBarIcon: ({color, size}) => (
                        <MaterialCommunityIcons name="magnify" color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="saved-matches"
                options={{
                    title: 'Matches',
                    tabBarIcon: ({color, size}) => (
                        <MaterialCommunityIcons name="bookmark" color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="availabilities"
                options={{
                    title: 'Availabilities',
                    tabBarIcon: ({color, size}) => (
                        <MaterialCommunityIcons name="clock-time-four" color={color} size={size} />
                    ),
                }}
            />
        </Tabs>
    );
}