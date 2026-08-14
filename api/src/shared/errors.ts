export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, 'VALIDATION_ERROR', message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(404, 'NOT_FOUND', message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, 'VERSION_CONFLICT', message);
    this.name = 'ConflictError';
  }
}

export class GoneError extends AppError {
  constructor(message: string) {
    super(410, 'SESSION_ENDED', message);
    this.name = 'GoneError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string) {
    super(429, 'RATE_LIMITED', message);
    this.name = 'RateLimitError';
  }
}

export class AiError extends AppError {
  constructor(message: string) {
    super(502, 'AI_ERROR', message);
    this.name = 'AiError';
  }
}
