/**
 * Функции для работы с множественным числом в разных языках
 */

/**
 * Русское множественное число
 * @param count - количество
 * @param one - форма для 1 (шаг)
 * @param few - форма для 2-4 (шага)
 * @param many - форма для 5+ (шагов)
 */
export function getRussianPlural(count: number, one: string, few: string, many: string): string {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return one;
  }
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return few;
  }
  return many;
}

/**
 * Английское множественное число
 * @param count - количество
 * @param singular - форма для 1 (step)
 * @param plural - форма для 2+ (steps)
 */
export function getEnglishPlural(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}

/**
 * Универсальная функция для множественного числа
 */
export function getPlural(
  count: number,
  language: string,
  translations: { steps: string; stepsPlural: string; stepsPluralMany: string }
): string {
  if (language === 'ru') {
    return getRussianPlural(count, translations.steps, translations.stepsPlural, translations.stepsPluralMany);
  }
  // Английский и другие языки
  return getEnglishPlural(count, translations.steps, translations.stepsPlural);
}
