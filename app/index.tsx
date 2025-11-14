import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '@/constants/colors';

export default function Index() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkTermsAcceptance();
  }, []);

  const checkTermsAcceptance = async () => {
    try {
      const hasAccepted = await AsyncStorage.getItem('hasAcceptedTerms');

      if (hasAccepted === 'true') {
        router.replace('/(tabs)/chat');
      } else {
        router.replace('/welcome');
      }
    } catch (error) {
      console.error('Error checking terms acceptance:', error);
      // В случае ошибки показываем welcome screen для безопасности
      router.replace('/welcome');
    } finally {
      setIsChecking(false);
    }
  };

  // Показываем загрузку пока проверяем
  if (isChecking) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
});