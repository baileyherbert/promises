import { EventEmitter } from '@baileyherbert/events';
import { Action } from '@baileyherbert/types';
import { OperationCancelledError } from './OperationCancelledError';

/**
 * Used to listen for signals that an operation should be cancelled.
 */
export class CancellationToken extends EventEmitter<CancellationTokenEvents> {

	private _cancellationActions = new Set<Action>();
	private _isCancellationRequested = false;

	/**
	 * Constructs a new `CancellationToken`.
	 */
	private constructor() {
		super();
	}

	/**
	 * Returns whether cancellation has been requested.
	 */
	public get isCancellationRequested() {
		return this._isCancellationRequested;
	}

	/**
	 * Throws a `OperationCancelledError` if cancellation has been requested.
	 */
	public throwIfCancellationRequested() {
		if (this._isCancellationRequested) {
			throw new OperationCancelledError();
		}
	}

	/**
	 * Registers an action that will be invoked when cancellation is requested.
	 *
	 * @param action
	 */
	public register(action: Action) {
		if (this._isCancellationRequested) {
			action();
			return;
		}

		this._cancellationActions.add(action);
	}

	/**
	 * Updates the token to request cancellation.
	 *
	 * @internal
	 */
	public _invokeCancellation() {
		if (!this._isCancellationRequested) {
			this._isCancellationRequested = true;
			this.emit('canceled');

			for (const action of this._cancellationActions) {
				action();
			}
		}
	}

	/**
	 * Resets the state of the token.
	 *
	 * @internal
	 */
	public _reset() {
		this._isCancellationRequested = false;
		this._cancellationActions.clear();
	}

}

type CancellationTokenEvents = {
	canceled: [];
}
