export const apiError = (
  message: string,
  details: Record<string, any> | null,
  path: string,
) => {
  return {
    data: null,
    error: {
      message,
      details,
      path,
    },
  };
};
