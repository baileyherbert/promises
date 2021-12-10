import { CancellationToken } from './CancellationToken';

export class CancellationTokenSource {

	/**
	 * Whether cancellation has already been requested.
	 */
	protected _isCancellationRequested = false;

	/**
	 * The underlying cancellation token.
	 */
	protected _token?: CancellationToken;

	/**
	 * The duration of the timeout, in milliseconds, if one is set.
	 */
	protected _timeoutDuration?: number;

	/**
	 * The timeout identifier for cancellation, if one is set.
	 */
	protected _timeout?: NodeJS.Timeout;

	/**
	 * Constructs a new `CancellationTokenSource` instance.
	 */
	public constructor();

	/**
	 * Constructs a new `CancellationTokenSource` instance which will be canceled after the specified delay.
	 *
	 * @param duration The number of milliseconds after which the source will automatically be canceled.
	 */
	public constructor(duration: number);
	public constructor(duration?: number) {
		// @ts-ignore Hi, how's it going? :-P
		this._token = new CancellationToken();

		if (typeof duration === 'number' && duration >= 0) {
			this.cancelAfter(duration);
		}
	}

	/**
	 * Whether cancellation has been requested for this source.
	 */
	public get isCancellationRequested() {
		return this._isCancellationRequested;
	}

	/**
	 * The `CancellationToken` instance associated with this source.
	 */
	public get token() {
		if (!this._token) {
			throw new Error('Token was disposed');
		}

		return this._token;
	}

	/**
	 * Communicates a request for cancellation.
	 */
	public cancel() {
		if (!this._isCancellationRequested) {
			this._isCancellationRequested = true;
			this.token._invokeCancellation();
		}
	}

	/**
	 * Schedules a cancel operation on this source after the specified delay. If there is already another scheduled
	 * cancel operation, it will be overridden.
	 *
	 * @param duration The number of milliseconds after which the source will automatically be canceled.
	 */
	public cancelAfter(duration: number) {
		if (!this._isCancellationRequested) {
			if (this._timeout) {
				clearTimeout(this._timeout);
			}

			if (duration > 0) {
				this._timeoutDuration = duration;
				this._timeout = setTimeout(() => {
					this.cancel();
				}, duration);
			}

			else if (duration === 0) {
				this.cancel();
			}
		}
	}

	/**
	 * Releases all resources used by the source and clears any pending timeouts.
	 */
	public dispose() {
		this._token = undefined;
		this._timeoutDuration = undefined;

		if (this._timeout) {
			clearTimeout(this._timeout);
		}
	}

	/**
	 * Resets the source to its default state.
	 *
	 * @param resetTimeouts
	 *   When true and the source had a cancellation timeout, then a new timeout will be recreated with the same
	 *   duration. Defaults to `false`.
	 */
	public reset(resetTimeouts = false) {
		this.token._reset();
		this._isCancellationRequested = false;

		if (this._timeout) {
			clearTimeout(this._timeout);

			const duration = this._timeoutDuration!;
			this._timeoutDuration = undefined;

			if (resetTimeouts) {
				this.cancelAfter(duration);
			}
		}
	}

	/**
	 * Creates a `CancellationTokenSource` that will be in the canceled state when the supplied token is in the
	 * canceled state.
	 *
	 * @param token
	 */
	public static createLinked(token: CancellationToken): CancellationTokenSource;

	/**
	 * Creates a `CancellationTokenSource` that will be in the canceled state when any of the supplied tokens are in
	 * the canceled state.
	 *
	 * @param token
	 */
	public static createLinked(tokens: CancellationToken[]): CancellationTokenSource;
	public static createLinked(tokens: CancellationToken | CancellationToken[]): CancellationTokenSource {
		const tokensArr = Array.isArray(tokens) ? tokens : [tokens];
		const source = new CancellationTokenSource();

		for (const token of tokensArr) {
			token.register(() => {
				source.cancel();
			});
		}

		return source;
	}

}
