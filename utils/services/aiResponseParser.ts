export type AIRecipe = {
  id: string; // Уникальный ID для навигации и избранного
  title: string;
  time: string;
  calories?: string; // Калории (необязательное поле)
  steps: string[];
};

export type AIResponse = {
  success: boolean;
  recipes?: AIRecipe[];
  greeting?: string; // Приветствие от AI
  error?: string;
};

/**
 * Парсит ответ от AI и извлекает приветствие и структурированные рецепты
 * @param text - текст ответа от AI
 * @returns объект с приветствием и массивом рецептов
 */
export function parseAIResponse(text: string): {
  greeting: string;
  recipes: AIRecipe[];
} {
  let greeting = '';
  const recipes: AIRecipe[] = [];

  // Извлекаем приветствие (убираем теги [ПРИВЕТСТВИЕ])
  const greetingMatch = text.match(/\[ПРИВЕТСТВИЕ\]([\s\S]*?)\[\/ПРИВЕТСТВИЕ\]/i);
  if (greetingMatch) {
    greeting = greetingMatch[1]
      .trim()
      .replace(/^приветствие:?\s*/i, '') // Убираем слово "приветствие" в начале
      .trim();
    // Удаляем приветствие из текста для дальнейшего парсинга
    text = text.replace(/\[ПРИВЕТСТВИЕ\][\s\S]*?\[\/ПРИВЕТСТВИЕ\]/i, '');
  }

  // Если приветствие не найдено в тегах, ищем в начале текста
  if (!greeting) {
    const lines = text.split('\n');
    const firstNonEmptyLine = lines.find((line) => line.trim().length > 0);
    if (
      firstNonEmptyLine &&
      !firstNonEmptyLine.match(/^#+/) &&
      !firstNonEmptyLine.match(/^\*\*/)
    ) {
      greeting = firstNonEmptyLine.trim();
    }
  }

  // Новый парсинг под формат:
  // ### Название рецепта
  // **Время приготовления:** X минут
  // **Шаги:**
  // 1. Шаг 1
  // 2. Шаг 2
  // ---

  const lines = text.split('\n');
  let currentRecipe: Partial<AIRecipe> | null = null;
  let collectingSteps = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Пропускаем разделители
    if (line === '---' || line === '') {
      if (currentRecipe && currentRecipe.title && collectingSteps) {
        // Завершаем текущий рецепт
        recipes.push({
          id: `ai-${Date.now()}-${recipes.length}`,
          title: currentRecipe.title,
          time: currentRecipe.time || 'Не указано',
          calories: currentRecipe.calories,
          steps: currentRecipe.steps || [],
        });
        currentRecipe = null;
        collectingSteps = false;
      }
      continue;
    }

    // Ищем название рецепта (начинается с ### или **)
    if (
      line.match(/^###\s+/) ||
      (line.match(/^\*\*.*\*\*$/) && !line.match(/время|шаги|калории/i))
    ) {
      // Сохраняем предыдущий рецепт, если он был
      if (currentRecipe && currentRecipe.title) {
        recipes.push({
          id: `ai-${Date.now()}-${recipes.length}`,
          title: currentRecipe.title,
          time: currentRecipe.time || 'Не указано',
          calories: currentRecipe.calories,
          steps: currentRecipe.steps || [],
        });
      }

      // Начинаем новый рецепт
      currentRecipe = {
        title: line.replace(/^###\s+/, '').replace(/[\*]/g, '').trim(),
        steps: [],
      };
      collectingSteps = false;
    }
    // Ищем время приготовления
    else if (line.match(/\*\*время|Время приготовления/i) && currentRecipe) {
      const timeMatch = line.match(/:\*\*\s*(.+)/);
      if (timeMatch) {
        currentRecipe.time = timeMatch[1].trim();
      } else {
        const simpleMatch = line.match(/:\s*(.+)/);
        if (simpleMatch) {
          currentRecipe.time = simpleMatch[1].replace(/\*/g, '').trim();
        }
      }
    }
    // Ищем калории
    else if (line.match(/\*\*калории|Калории/i) && currentRecipe) {
      const caloriesMatch = line.match(/:\*\*\s*(.+)/);
      if (caloriesMatch) {
        currentRecipe.calories = caloriesMatch[1].trim();
      } else {
        const simpleMatch = line.match(/:\s*(.+)/);
        if (simpleMatch) {
          currentRecipe.calories = simpleMatch[1].replace(/\*/g, '').trim();
        }
      }
    }
    // Ищем начало шагов
    else if (line.match(/\*\*шаги|Шаги\*\*/i) && currentRecipe) {
      collectingSteps = true;
      currentRecipe.steps = [];
    }
    // Собираем шаги (только если идёт сбор шагов и строка начинается с цифры)
    else if (collectingSteps && currentRecipe && line.match(/^\d+[\.\)]/)) {
      const step = line.replace(/^\d+[\.\)]\s*/, '').trim();
      if (step.length > 0 && !step.match(/^[\-\*]+$/)) {
        currentRecipe.steps!.push(step);
      }
    }
  }

  // Сохраняем последний рецепт
  if (currentRecipe && currentRecipe.title) {
    recipes.push({
      id: `ai-${Date.now()}-${recipes.length}`,
      title: currentRecipe.title,
      time: currentRecipe.time || 'Не указано',
      calories: currentRecipe.calories,
      steps: currentRecipe.steps || [],
    });
  }

  // Добавляем ID ко всем рецептам, если его нет
  const recipesWithIds = recipes.map((recipe, index) => ({
    ...recipe,
    id: recipe.id || `ai-${Date.now()}-${index}`,
  }));

  return {
    greeting,
    recipes: recipesWithIds,
  };
}
