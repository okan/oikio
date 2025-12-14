export enum ErrorCode {
  UNKNOWN = 'UNKNOWN',
  NETWORK = 'NETWORK',
  TIMEOUT = 'TIMEOUT',
  VALIDATION = 'VALIDATION',
  REQUIRED_FIELD = 'REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  NOT_FOUND = 'NOT_FOUND',
  DUPLICATE = 'DUPLICATE',
  DATABASE_ERROR = 'DATABASE_ERROR',
  INVALID_OPERATION = 'INVALID_OPERATION',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
}
export class AppError extends Error {
  public readonly code: ErrorCode
  public readonly userMessage: string
  public readonly details?: Record<string, unknown>
  public readonly timestamp: Date
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.UNKNOWN,
    userMessage?: string,
    details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.userMessage = userMessage || this.getDefaultUserMessage(code)
    this.details = details
    this.timestamp = new Date()
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
  }
  private getDefaultUserMessage(code: ErrorCode): string {
    const messages: Record<ErrorCode, string> = {
      [ErrorCode.UNKNOWN]: 'Beklenmeyen bir hata oluştu',
      [ErrorCode.NETWORK]: 'Ağ bağlantısı hatası',
      [ErrorCode.TIMEOUT]: 'İşlem zaman aşımına uğradı',
      [ErrorCode.VALIDATION]: 'Girilen bilgiler geçersiz',
      [ErrorCode.REQUIRED_FIELD]: 'Zorunlu alan boş bırakılamaz',
      [ErrorCode.INVALID_FORMAT]: 'Geçersiz format',
      [ErrorCode.NOT_FOUND]: 'Kayıt bulunamadı',
      [ErrorCode.DUPLICATE]: 'Bu kayıt zaten mevcut',
      [ErrorCode.DATABASE_ERROR]: 'Veritabanı hatası',
      [ErrorCode.INVALID_OPERATION]: 'Bu işlem gerçekleştirilemez',
      [ErrorCode.PERMISSION_DENIED]: 'Bu işlem için yetkiniz yok',
    }
    return messages[code]
  }
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
    }
  }
}
export class ValidationError extends AppError {
  public readonly fieldErrors: Record<string, string>
  constructor(fieldErrors: Record<string, string>, message = 'Validation failed') {
    super(message, ErrorCode.VALIDATION, 'Lütfen formu kontrol edin', { fieldErrors })
    this.name = 'ValidationError'
    this.fieldErrors = fieldErrors
  }
}
export class NotFoundError extends AppError {
  constructor(entity: string, id?: string | number) {
    const message = id ? `${entity} with id ${id} not found` : `${entity} not found`
    super(message, ErrorCode.NOT_FOUND, `${entity} bulunamadı`)
    this.name = 'NotFoundError'
  }
}
export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error
  }
  if (error instanceof Error) {
    return new AppError(error.message, ErrorCode.UNKNOWN, error.message)
  }
  if (typeof error === 'string') {
    return new AppError(error, ErrorCode.UNKNOWN, error)
  }
  return new AppError('An unknown error occurred', ErrorCode.UNKNOWN)
}
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.userMessage
  }
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'Beklenmeyen bir hata oluştu'
}
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError
}
export function logError(error: unknown, context?: Record<string, unknown>): void {
  const appError = handleError(error)
  if (process.env.NODE_ENV === 'development') {
    console.error('[Error]', {
      ...appError.toJSON(),
      context,
    })
  }
}
export function createErrorHandler<T>(
  onError?: (error: AppError) => void
): (promise: Promise<T>) => Promise<T> {
  return async (promise: Promise<T>) => {
    try {
      return await promise
    } catch (error) {
      const appError = handleError(error)
      logError(appError)
      onError?.(appError)
      throw appError
    }
  }
}
