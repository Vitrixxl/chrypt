export type MutationParams<T extends unknown> = {
  onSuccess?: (data: T) => void;
  onError?: (error: Error, data: T) => void;
  onSettled?: () => void;
};
