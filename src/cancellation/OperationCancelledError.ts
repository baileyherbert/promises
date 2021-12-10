/**
 * Thrown to signal that an operation was cancelled.
 */
export class OperationCancelledError extends Error {
	public constructor() {
		super('The operation was cancelled by request');
	}
}
