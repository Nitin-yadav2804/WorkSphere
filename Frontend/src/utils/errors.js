// Callers keep their existing fallback wording and whether to expose Error.message.
export const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || fallback;

export const getErrorDetails = (error) => error.response?.data || error.message;
