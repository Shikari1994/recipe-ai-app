/**
 * Вспомогательные функции для работы с рецептами
 */

/**
 * Извлекает только число из времени
 * "30 минут" -> "30", "30" -> "30"
 */
export const extractTime = (time: string): string => {
  if (!time || time === 'Не указано') return '~';
  const match = time.match(/(\d+)/);
  return match ? match[1] : '~';
};

/**
 * Извлекает только число из калорий
 * "220 ккал" -> "220", "220" -> "220"
 */
export const extractCalories = (calories?: string): string => {
  if (!calories) return '~';
  const match = calories.match(/(\d+)/);
  return match ? match[1] : '~';
};
