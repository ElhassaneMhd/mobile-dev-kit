export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION = 'VALIDATION',
  SERVER = 'SERVER',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN',
}

export interface AppError {
  type: ErrorType;
  message: string;
  userMessage: string;
  statusCode?: number;
  originalError?: Error;
  canRetry: boolean;
}

/**
 * Parse error from API response or network failure
 */
export function parseError(error: any): AppError {
  // Network errors
  if (!error.response && (error.message === 'Network Error' || error.code === 'ECONNABORTED')) {
    return {
      type: ErrorType.NETWORK,
      message: error.message,
      userMessage: 'Pas de connexion internet. Veuillez verifier votre connexion.',
      canRetry: true,
      originalError: error,
    };
  }

  // Timeout errors
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return {
      type: ErrorType.TIMEOUT,
      message: error.message,
      userMessage: 'La requete a expire. Veuillez reessayer.',
      canRetry: true,
      originalError: error,
    };
  }

  const statusCode = error.response?.status;

  // Authentication errors (401)
  if (statusCode === 401) {
    return {
      type: ErrorType.AUTHENTICATION,
      message: error.response?.data?.message || 'Unauthorized',
      userMessage: 'Session expiree. Veuillez vous reconnecter.',
      statusCode,
      canRetry: false,
      originalError: error,
    };
  }

  // Authorization errors (403)
  if (statusCode === 403) {
    return {
      type: ErrorType.AUTHORIZATION,
      message: error.response?.data?.message || 'Forbidden',
      userMessage: 'Vous n\'avez pas les permissions necessaires.',
      statusCode,
      canRetry: false,
      originalError: error,
    };
  }

  // Not found errors (404)
  if (statusCode === 404) {
    return {
      type: ErrorType.NOT_FOUND,
      message: error.response?.data?.message || 'Not found',
      userMessage: 'Ressource non trouvee.',
      statusCode,
      canRetry: false,
      originalError: error,
    };
  }

  // Validation errors (400, 422)
  if (statusCode === 400 || statusCode === 422) {
    return {
      type: ErrorType.VALIDATION,
      message: error.response?.data?.message || 'Validation error',
      userMessage: error.response?.data?.message || 'Donnees invalides.',
      statusCode,
      canRetry: false,
      originalError: error,
    };
  }

  // Server errors (500+)
  if (statusCode && statusCode >= 500) {
    return {
      type: ErrorType.SERVER,
      message: error.response?.data?.message || 'Server error',
      userMessage: 'Erreur serveur. Veuillez reessayer plus tard.',
      statusCode,
      canRetry: true,
      originalError: error,
    };
  }

  // Unknown errors
  return {
    type: ErrorType.UNKNOWN,
    message: error.message || 'Unknown error',
    userMessage: 'Une erreur est survenue. Veuillez reessayer.',
    canRetry: true,
    originalError: error,
  };
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: any): string {
  const appError = parseError(error);
  return appError.userMessage;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: any): boolean {
  const appError = parseError(error);
  return appError.canRetry;
}

/**
 * Get error type from error object
 */
export function getErrorType(error: any): ErrorType {
  const appError = parseError(error);
  return appError.type;
}
