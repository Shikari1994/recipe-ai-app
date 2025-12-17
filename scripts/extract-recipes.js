/* eslint-env node */
/* eslint-disable no-undef, no-unused-vars */
const fs = require('fs');
const path = require('path');

// Читаем файл recipes.ts
const recipesFilePath = path.join(__dirname, '..', 'data', 'recipes.ts');
const content = fs.readFileSync(recipesFilePath, 'utf-8');

// Находим массив рецептов
const recipesArrayMatch = content.match(/export const recipesDatabase: Recipe\[\] = \[([\s\S]+?)\];/);

if (!recipesArrayMatch) {
  console.error('Не удалось найти массив рецептов');
  process.exit(1);
}

// Извлекаем только массив рецептов и очищаем от TypeScript-специфичного синтаксиса
const recipesArrayString = `[${recipesArrayMatch[1]}]`;

// Заменяем TypeScript синтаксис на валидный JSON
let jsonString = recipesArrayString
  .replace(/(\w+):/g, '"$1":')  // добавляем кавычки к ключам
  .replace(/'/g, '"')            // заменяем одинарные кавычки на двойные
  .replace(/,(\s*[}\]])/g, '$1'); // убираем trailing commas

try {
  // Парсим и валидируем JSON
  const recipes = eval('(' + recipesArrayString + ')'); // используем eval для корректного парсинга JS объектов

  // Записываем в JSON файл
  const outputPath = path.join(__dirname, '..', 'data', 'recipes.json');
  fs.writeFileSync(outputPath, JSON.stringify(recipes, null, 2), 'utf-8');

  console.log(`✅ Успешно извлечено ${recipes.length} рецептов в recipes.json`);
} catch (error) {
  console.error('Ошибка при обработке рецептов:', error);
  process.exit(1);
}
