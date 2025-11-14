// require('dotenv').config(); // Временно отключено для тестирования

module.exports = {
  expo: {
    name: "Myapp",
    slug: "Myapp",
    version: "1.0.0",
    orientation: "portrait",
    // icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true
    },
    android: {
      package: "com.myapp.recipeai",
      permissions: [
        "android.permission.CAMERA",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE",
        "android.permission.READ_MEDIA_IMAGES"
      ],
      softwareKeyboardLayoutMode: "pan"
    },
    plugins: [
      "expo-router"
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true
    },
    extra: {
      openRouterApiKey: process.env.OPENROUTER_API_KEY || '',
      eas: {
        projectId: "e578b835-08ae-4134-9a08-5a8830f77045"
      }
    }
  }
};
