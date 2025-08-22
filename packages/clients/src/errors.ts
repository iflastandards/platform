/**
 * @ifla/clients
 * Custom error classes for the clients package.
 * Using custom errors allows consumers to handle specific failure
 * modes programmatically.
 */

/**
 * Base error class for all client-related errors.
 */
export class ClientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * Thrown when data fails validation (e.g., Zod parsing).
 */
export class ClientValidationError extends ClientError {}

/**
 * Thrown when a requested resource is not found.
 */
export class ClientNotFoundError extends ClientError {}

/**
 * Thrown for general API failures from the underlying service (e.g., Supabase, GitHub).
 */
export class ClientApiError extends ClientError {}