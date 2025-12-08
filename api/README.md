# Vercel Edge Function для OpenRouter API

Эта Edge Function скрывает ваш API ключ OpenRouter на стороне сервера.

## Преимущества Vercel Edge Functions

✅ **Щедрый бесплатный тариф:**
- 1,000,000 запросов в месяц (вместо 10k у Deno)
- 100 GB исходящего трафика
- Без лимита CPU time
- Поддержка изображений в запросах

✅ **Просто:**
- Один файл TypeScript
- Автоматическое развертывание через GitHub
- Встроенная аналитика

✅ **Быстро:**
- Глобальная Edge Network
- Мгновенный холодный старт
- Оптимизация для мобильных приложений

## Структура проекта

```
api/
  └── openrouter-proxy.ts   # Edge Function для проксирования к OpenRouter
vercel.json                 # Конфигурация Vercel
```

## Локальная разработка (опционально)

Если хотите тестировать локально:

1. Установите Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Войдите в аккаунт:
   ```bash
   vercel login
   ```

3. Запустите локально:
   ```bash
   vercel dev
   ```

Функция будет доступна на `http://localhost:3000/api/openrouter-proxy`

## Развертывание

### Автоматическое (рекомендуется)

1. Зарегистрируйтесь на [vercel.com](https://vercel.com) через GitHub
2. Импортируйте ваш репозиторий
3. Vercel автоматически обнаружит Edge Function
4. Добавьте переменную окружения `OPENROUTER_API_KEY`
5. При каждом push в main - автоматический deploy!

### Через CLI

```bash
vercel --prod
```

## URL вашей функции

После развертывания вы получите URL типа:
```
https://your-project.vercel.app/api/openrouter-proxy
```

Обновите `API_CONFIG.EDGE_FUNCTION_URL` в вашем приложении.

## Мониторинг

В панели Vercel доступны:
- Логи запросов
- Время ответа
- Количество вызовов
- Ошибки

## Тестирование

```bash
curl -X POST https://your-project.vercel.app/api/openrouter-proxy \
  -H "Content-Type: application/json" \
  -d '{
    "model": "google/gemini-2.5-flash-lite",
    "messages": [{"role": "user", "content": "Привет!"}],
    "max_tokens": 100
  }'
```
