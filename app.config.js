require('dotenv').config(); // Загружаем переменные окружения

module.exports = {
  expo: {
    name: "AI Recipe Assistant",
    slug: "Myapp",
    version: "1.2.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    backgroundColor: "#8A2BE2",
    splash: {
      image: "./assets/images/icon.png",
      resizeMode: "contain",
      backgroundColor: "#8A2BE2"
    },
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSSpeechRecognitionUsageDescription: "Это приложение использует распознавание речи для голосового ввода рецептов.",
        NSMicrophoneUsageDescription: "Это приложение использует микрофон для голосового ввода рецептов."
      }
    },
    android: {
      package: "com.myapp.recipeai",
      versionCode: 3,
      compileSdkVersion: 35,
      targetSdkVersion: 35,
      minSdkVersion: 23,
      permissions: [
        "android.permission.CAMERA",
        "android.permission.READ_MEDIA_IMAGES",
        "android.permission.RECORD_AUDIO"
      ],
      softwareKeyboardLayoutMode: "pan",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon-foreground.png",
        backgroundColor: "#8A2BE2"
      },
      navigationBar: {
        backgroundColor: "#000000",
        barStyle: "light-content"
      },
      statusBar: {
        backgroundColor: "#1a1a1a",
        barStyle: "light-content",
        translucent: false
      }
    },
    plugins: [
      "expo-router",
      "expo-font",
      "expo-web-browser",
      [
        "expo-speech-recognition",
        {
          microphonePermission: "Разрешите использование микрофона для голосового ввода рецептов.",
          speechRecognitionPermission: "Разрешите распознавание речи для голосового ввода рецептов."
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      openRouterApiKey: process.env.OPENROUTER_API_KEY,
      eas: {
        projectId: "e578b835-08ae-4134-9a08-5a8830f77045"
      }
    }
  }
};
