/**
 * Утилита для получения эмодзи для рецептов по типу блюда
 */

export function getRecipeEmoji(title: string): string {
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
}
