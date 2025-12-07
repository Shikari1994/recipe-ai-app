import React from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, getThemeColors } from '@/constants/colors';
import { scale, verticalScale, fontScale, moderateScale, BORDER_RADIUS } from '@/utils/responsive';
import { extractTime, extractCalories } from '@/utils/recipeHelpers';
import type { AIRecipe } from '@/types';

// Эмодзи для рецептов по типу блюда
const getRecipeEmoji = (title: string): string => {
  const lowerTitle = title.toLowerCase();

  // Яйца и омлеты
  if (lowerTitle.includes('яичниц') || lowerTitle.includes('омлет') || lowerTitle.includes('глазунь')) return '🍳';
  if (lowerTitle.includes('яйц') && (lowerTitle.includes('варен') || lowerTitle.includes('пашот'))) return '🥚';

  // Салаты
  if (lowerTitle.includes('салат')) return '🥗';

  // Супы
  if (lowerTitle.includes('суп') || lowerTitle.includes('борщ') || lowerTitle.includes('щи') ||
      lowerTitle.includes('солянк') || lowerTitle.includes('уха') || lowerTitle.includes('бульон')) return '🍲';

  // Паста и макароны
  if (lowerTitle.includes('паста') || lowerTitle.includes('макарон') || lowerTitle.includes('спагетти') ||
      lowerTitle.includes('лазань') || lowerTitle.includes('карбонар')) return '🍝';

  // Блины и оладьи
  if (lowerTitle.includes('блин') || lowerTitle.includes('оладь') || lowerTitle.includes('сырник')) return '🥞';

  // Каши
  if (lowerTitle.includes('каша') || lowerTitle.includes('овсянк')) return '🥣';

  // Азиатская кухня
  if (lowerTitle.includes('лапша') || lowerTitle.includes('рамен') || lowerTitle.includes('фо')) return '🍜';
  if (lowerTitle.includes('суши') || lowerTitle.includes('ролл')) return '🍣';
  if (lowerTitle.includes('рис') || lowerTitle.includes('плов')) return '🍚';

  // Мясные блюда
  if (lowerTitle.includes('стейк') || lowerTitle.includes('бифштекс')) return '🥩';
  if (lowerTitle.includes('курин') || lowerTitle.includes('курица') || lowerTitle.includes('куриц') ||
      lowerTitle.includes('цыплен') || lowerTitle.includes('крыл')) return '🍗';
  if (lowerTitle.includes('шашлык') || lowerTitle.includes('кебаб') || lowerTitle.includes('гриль')) return '🍖';
  if (lowerTitle.includes('котлет') || lowerTitle.includes('фрикадель') || lowerTitle.includes('тефтел')) return '🍔';

  // Рыба и морепродукты
  if (lowerTitle.includes('рыб') || lowerTitle.includes('лосось') || lowerTitle.includes('форель') ||
      lowerTitle.includes('сёмг') || lowerTitle.includes('семг') || lowerTitle.includes('треск')) return '🐟';
  if (lowerTitle.includes('креветк') || lowerTitle.includes('морепродукт')) return '🦐';

  // Выпечка и десерты
  if (lowerTitle.includes('пирог') || lowerTitle.includes('пирож') || lowerTitle.includes('запеканк')) return '🥧';
  if (lowerTitle.includes('торт') || lowerTitle.includes('кекс') || lowerTitle.includes('маффин')) return '🎂';
  if (lowerTitle.includes('печень') || lowerTitle.includes('круассан')) return '🥐';
  if (lowerTitle.includes('хлеб') || lowerTitle.includes('тост') || lowerTitle.includes('бутерброд') ||
      lowerTitle.includes('сэндвич') || lowerTitle.includes('брускет')) return '🍞';

  // Пицца
  if (lowerTitle.includes('пицц')) return '🍕';

  // Бургеры
  if (lowerTitle.includes('бургер') || lowerTitle.includes('гамбургер')) return '🍔';

  // Тако и буррито
  if (lowerTitle.includes('тако') || lowerTitle.includes('буррит') || lowerTitle.includes('начос')) return '🌮';

  // Овощные блюда
  if (lowerTitle.includes('овощ') || lowerTitle.includes('рагу') || lowerTitle.includes('тушен')) return '🥘';
  if (lowerTitle.includes('картоф') || lowerTitle.includes('картошк') || lowerTitle.includes('пюре')) return '🥔';

  // Фрукты и сладкое
  if (lowerTitle.includes('смузи') || lowerTitle.includes('коктейль')) return '🥤';
  if (lowerTitle.includes('мороженое') || lowerTitle.includes('десерт')) return '🍨';

  // Закуски
  if (lowerTitle.includes('закуск') || lowerTitle.includes('канапе')) return '🍢';

  // Дефолтная иконка - тарелка с едой
  return '🍽️';
};

type RecipePreviewCardProps = {
  recipe: AIRecipe;
  isDark: boolean;
  onPress: () => void;
};

const RecipePreviewCard = React.memo(({ recipe, isDark, onPress }: RecipePreviewCardProps) => {
  const themeColors = getThemeColors(isDark);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const emoji = getRecipeEmoji(recipe.title);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  // Цвета карточки в зависимости от темы
  const cardBgColor = isDark ? 'rgba(45, 45, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)';
  const emojiCircleBgColor = isDark ? 'rgba(139, 92, 246, 0.2)' : '#F3F0FF';

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[
        styles.recipeCard,
        {
          backgroundColor: cardBgColor,
          transform: [{ scale: scaleAnim }],
          borderWidth: isDark ? 1 : 0,
          borderColor: isDark ? 'rgba(139, 92, 246, 0.3)' : 'transparent',
        }
      ]}>
        {/* Иконка эмодзи */}
        <View style={styles.emojiContainer}>
          <View style={[styles.emojiCircle, { backgroundColor: emojiCircleBgColor }]}>
            <Text style={styles.emoji}>{emoji}</Text>
          </View>
        </View>

        {/* Контент карточки */}
        <View style={styles.cardContent}>
          <Text style={[styles.recipeName, { color: themeColors.text }]} numberOfLines={2}>
            {recipe.title}
          </Text>

          {/* Мета информация */}
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={moderateScale(14)} color={isDark ? '#A78BFA' : themeColors.textSecondary} />
              <Text style={[styles.metaText, { color: isDark ? '#A78BFA' : themeColors.textSecondary }]}>
                {extractTime(recipe.time)} мин
              </Text>
            </View>

            <View style={styles.metaItem}>
              <Ionicons name="flame" size={moderateScale(14)} color="#FF9500" />
              <Text style={[styles.metaText, { color: isDark ? '#FFB347' : themeColors.textSecondary }]}>
                {extractCalories(recipe.calories)}
              </Text>
            </View>

            <View style={[styles.stepsButton, { backgroundColor: '#FF9500' }]}>
              <Ionicons name="list" size={moderateScale(12)} color="#fff" />
              <Text style={styles.stepsText}>{recipe.steps.length}</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
});

type AIMessageBubbleProps = {
  text: string;
  recipes?: AIRecipe[];
  isDark: boolean;
  onRecipePress: (recipe: AIRecipe) => void;
};

export const AIMessageBubble = React.memo(({ text, recipes, isDark, onRecipePress }: AIMessageBubbleProps) => {
  const themeColors = getThemeColors(isDark);
  const hasRecipes = recipes && recipes.length > 0;

  return (
    <View style={styles.container}>
      {/* AI Аватар */}
      <View style={styles.avatarContainer}>
        <LinearGradient
          colors={['#A78BFA', '#8B5CF6']}
          style={styles.avatar}
        >
          <Text style={styles.avatarEmoji}>🤖</Text>
        </LinearGradient>
      </View>

      {/* Облако сообщения */}
      <View style={styles.bubbleContainer}>
        <BlurView
          intensity={isDark ? 40 : 30}
          tint={isDark ? 'dark' : 'light'}
          style={styles.blur}
        />
        <View style={[
          styles.bubbleOverlay,
          { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.85)' }
        ]} />

        <View style={styles.bubbleContent}>
          {/* Текст сообщения */}
          <Text style={[styles.messageText, { color: themeColors.text }]}>
            {text}
          </Text>

          {/* Карточки рецептов */}
          {hasRecipes && (
            <View style={styles.recipesContainer}>
              {recipes.map((recipe) => (
                <RecipePreviewCard
                  key={recipe.id}
                  recipe={recipe}
                  isDark={isDark}
                  onPress={() => onRecipePress(recipe)}
                />
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: verticalScale(16),
    maxWidth: '95%',
  },
  avatarContainer: {
    marginRight: scale(8),
    marginTop: verticalScale(4),
  },
  avatar: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: fontScale(18),
  },
  bubbleContainer: {
    flex: 1,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.2)',
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
  },
  bubbleOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  bubbleContent: {
    padding: scale(16),
  },
  messageText: {
    fontSize: fontScale(15),
    lineHeight: moderateScale(22),
    fontWeight: '500',
  },
  recipesContainer: {
    marginTop: verticalScale(16),
    gap: verticalScale(12),
  },
  // Recipe Card Styles
  recipeCard: {
    borderRadius: BORDER_RADIUS.lg,
    padding: scale(12),
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  emojiContainer: {
    marginRight: scale(12),
  },
  emojiCircle: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: fontScale(24),
  },
  cardContent: {
    flex: 1,
  },
  recipeName: {
    fontSize: fontScale(15),
    fontWeight: '600',
    lineHeight: moderateScale(20),
    marginBottom: verticalScale(8),
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  metaText: {
    fontSize: fontScale(12),
    fontWeight: '500',
  },
  stepsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: scale(12),
  },
  stepsText: {
    color: '#fff',
    fontSize: fontScale(12),
    fontWeight: '700',
  },
});
