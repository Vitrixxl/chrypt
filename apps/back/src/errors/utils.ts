export const apiError = (
  message: string,
  details: Record<string, any> | null,
) => {
  return {
    data: null,
    error: {
      message,
      details,
    },
  };
};
