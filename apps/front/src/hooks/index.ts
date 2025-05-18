export type MutationParams<T extends any> = {
  onSuccess?: (data: T) => void;
  onError?: (error: Error, data: T) => void;
  onSettled?: () => void;
};
