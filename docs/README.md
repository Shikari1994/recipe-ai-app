# Recipe AI - Legal Documents

Этот каталог содержит юридические документы для приложения Recipe AI.

## Документы

- **[Privacy Policy](privacy.html)** - Политика конфиденциальности
- **[Terms of Service](terms.html)** - Условия использования

## Размещение на GitHub Pages

### Вариант 1: Через основной репозиторий

1. Скопируйте файлы `privacy.html` и `terms.html` в корень вашего репозитория или в папку `docs/`
2. Зайдите в Settings → Pages вашего репозитория
3. В разделе "Source" выберите:
   - **Branch:** `main` (или `master`)
   - **Folder:** `/docs` (если файлы в папке docs) или `/ (root)` (если в корне)
4. Нажмите "Save"
5. Подождите 1-2 минуты
6. Ваши документы будут доступны по адресу:
   - `https://ваш-username.github.io/название-репозитория/privacy.html`
   - `https://ваш-username.github.io/название-репозитория/terms.html`

### Вариант 2: Отдельный репозиторий для документов

1. Создайте новый публичный репозиторий, например `recipe-ai-legal`
2. Загрузите файлы `privacy.html` и `terms.html`
3. Включите GitHub Pages (Settings → Pages)
4. URL будет: `https://ваш-username.github.io/recipe-ai-legal/privacy.html`

### Вариант 3: Использовать другой хостинг

Можно также использовать:
- **Netlify** (бесплатно) - drag & drop файлов
- **Vercel** (бесплатно) - автодеплой из GitHub
- **Firebase Hosting** (бесплатно) - от Google

## После размещения

1. Обновите URL в коде приложения:
   - В файле `app/(tabs)/profile.tsx` замените:
     ```typescript
     'https://ЗАМЕНИТЕ_НА_ВАШ_URL/privacy.html'
     'https://ЗАМЕНИТЕ_НА_ВАШ_URL/terms.html'
     ```
   - В файле `app/welcome.tsx` замените те же URL

2. Укажите URL Privacy Policy в:
   - **Google Play Console** → App content → Privacy Policy
   - **App Store Connect** → App Privacy → Privacy Policy URL

## Обновление документов

При изменении функционала приложения не забудьте:
1. Обновить файлы HTML
2. Изменить дату в документах
3. Инкрементировать версию документа
4. Уведомить пользователей об изменениях (через обновление приложения)

## Контакты

Если нужно изменить email для связи, замените `support@recipeai.app` на ваш реальный email в обоих HTML файлах.
