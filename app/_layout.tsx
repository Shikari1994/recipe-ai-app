import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '@/utils/ThemeContext';
import { LanguageProvider } from '@/utils/LanguageContext';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { Text, TextInput, Platform } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { customDarkTheme, customLightTheme } from '@/constants/paperTheme';

// Предотвращаем автоскрытие splash screen
SplashScreen.preventAutoHideAsync();

// Устанавливаем Inter как шрифт по умолчанию для всех Text
const originalTextRender = (Text as any).render;
(Text as any).render = function (props: any, ref: any) {
  const style = props.style || {};
  const fontWeight = style.fontWeight;

  let fontFamily = 'Inter_400Regular';
  if (fontWeight === '500' || fontWeight === 500) {
    fontFamily = 'Inter_500Medium';
  } else if (fontWeight === '600' || fontWeight === 600) {
    fontFamily = 'Inter_600SemiBold';
  } else if (fontWeight === '700' || fontWeight === 700 || fontWeight === 'bold') {
    fontFamily = 'Inter_700Bold';
  }

  return originalTextRender.call(this, {
    ...props,
    style: [{ fontFamily }, style],
  }, ref);
};

// Устанавливаем Inter для TextInput
const originalTextInputRender = (TextInput as any).render;
(TextInput as any).render = function (props: any, ref: any) {
  return originalTextInputRender.call(this, {
    ...props,
    style: [{ fontFamily: 'Inter_400Regular' }, props.style],
  }, ref);
};

function RootLayoutContent() {
  const { isDark, colors } = useTheme();
  const paperTheme = isDark ? customDarkTheme : customLightTheme;

  // Set navigation bar color based on theme
  useEffect(() => {
    if (Platform.OS === 'android') {
      SystemUI.setBackgroundColorAsync(colors.background);
    }
  }, [isDark, colors.background]);

  return (
    <PaperProvider theme={paperTheme}>
      <StatusBar
        style={isDark ? 'light' : 'dark'}
        backgroundColor={isDark ? '#1a1a1a' : '#ffffff'}
        translucent={false}
      />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="recipe/[id]"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </PaperProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <LanguageProvider>
        <RootLayoutContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}