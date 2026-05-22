const { withAndroidManifest } = require('expo/config-plugins');

// Workaround for React Native New Architecture crash on Android 13+:
// Hermes GC thread (hades) frees a Fabric ShadowNodeWrapper whose pointer tag
// has been truncated, causing SIGABRT via Android's Memory Tagging Extension.
// Disabling native heap pointer tagging suppresses this false-positive abort.
// See: https://github.com/facebook/react-native/issues/37440
const withDisablePointerTagging = (config) => {
  if (config.modRequest?.platform !== 'android') {
    return config;
  }

  return withAndroidManifest(config, (modConfig) => {
    const app = modConfig.modResults.manifest.application?.[0];
    if (app?.$) {
      app.$['android:allowNativeHeapPointerTagging'] = 'false';
    }
    return modConfig;
  });
};

module.exports = withDisablePointerTagging({
  expo: {
    name: "Local Hobbies",
    slug: "local-hobbies-frontend",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "localhobbiesfrontend",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.yourname.app",
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "This app uses your location to set home and availability locations."
      },
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY //TODO: separate keys
      }
    },
    android: {
      package: "com.yourname.app",
      permissions: [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION"
      ],
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY
        }
      },
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      "expo-secure-store",
      "@react-native-community/datetimepicker",
      withDisablePointerTagging
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      eas: {
        projectId: "cbd916a1-dd6d-4397-804a-b2e76631fd21"
      }
    }
  }
})
