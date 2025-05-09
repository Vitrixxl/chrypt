import { Result, tryCatch } from '@shrymp/utils';
import React from 'react';

type AsyncFunction<T = any> = (...args: any[]) => Promise<T>;

type UseActionParams<T extends AsyncFunction> = {
  fn: T;
  onSuccess?: () => void;
  onError?: () => void;
};
export const useAction = <T extends AsyncFunction>(
  { fn, onSuccess, onError }: UseActionParams<T>,
) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const wrappedFunction = async (
    ...args: Parameters<T>
  ): Promise<Result<Awaited<ReturnType<T>>>> => {
    setIsLoading(true);
    setError(null);
    const { data, error } = await tryCatch(fn(...args));
    if (error) {
      setIsLoading(false);
      setError(error.message);
      onError && onError();
      return { data: null, error };
    }
    setIsLoading(false);
    onSuccess && onSuccess();
    return { data, error };
  };

  return {
    execute: wrappedFunction,
    isLoading,
    error,
  };
};
