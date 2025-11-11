import { useState, useCallback, useEffect } from 'react';

/**
 * Состояние асинхронной операции
 */
interface AsyncState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

/**
 * Опции для хука useAsync
 */
interface UseAsyncOptions {
  immediate?: boolean; // Выполнить сразу при монтировании
}

/**
 * Универсальный хук для обработки асинхронных операций
 * Управляет состояниями loading/error/data
 *
 * @param asyncFunction - асинхронная функция для выполнения
 * @param options - опции конфигурации
 * @returns объект с данными, ошибкой, состоянием загрузки и функцией execute
 *
 * @example
 * const { data, error, isLoading, execute } = useAsync(
 *   async () => await fetchData(),
 *   { immediate: true }
 * );
 */
export function useAsync<T, Args extends unknown[] = []>(
  asyncFunction: (...args: Args) => Promise<T>,
  options: UseAsyncOptions = {}
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const execute = useCallback(
    async (...args: Args): Promise<T | null> => {
      setState({ data: null, error: null, isLoading: true });

      try {
        const result = await asyncFunction(...args);
        setState({ data: result, error: null, isLoading: false });
        return result;
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        setState({ data: null, error: errorObj, isLoading: false });
        return null;
      }
    },
    [asyncFunction]
  );

  useEffect(() => {
    if (options.immediate) {
      // @ts-ignore - Calling execute without args for immediate execution
      execute();
    }
  }, [execute, options.immediate]);

  return {
    ...state,
    execute,
  };
}
