/**
 * This utility class allows you to create a `Promise` instance and then resolve or reject it from the outside using
 * the `resolve()` and `reject()` methods.
 */
 export class PromiseCompletionSource<T> {

	/**
	 * The underlying promise.
	 */
	protected _promise: Promise<T>;

	/**
	 * The internal function used to resolve the promise.
	 */
	protected _resolve: (value: T) => void;

	/**
	 * The internal function used to reject the promise.
	 */
	protected _reject: (err?: any) => void;

	/**
	 * Whether or not the promise has completed (either resolved or rejected).
	 */
	protected _isFinished = false;

	/**
	 * Whether or not the promise has been resolved.
	 */
	protected _isResolved = false;

	/**
	 * Whether or not the promise has been rejected.
	 */
	protected _isRejected = false;

	/**
	 * Constructs a new `PromiseCompletionSource<T>` instance.
	 */
	public constructor() {
		this._resolve = () => {};
		this._reject = () => {};
		this._promise = new Promise((resolve, reject) => {
			this._resolve = resolve;
			this._reject = reject;
		});
	}

	/**
	 * The underlying promise that can be awaited.
	 */
	public get promise() {
		return this._promise;
	}

	/**
	 * Returns `true` when the promise source has either resolved or rejected.
	 */
	public get isFinished() {
		return this._isFinished;
	}

	/**
	 * Returns `true` if the promise was resolved.
	 */
	public get isResolved() {
		return this._isResolved;
	}

	/**
	 * Returns `true` if the promise was rejected.
	 */
	public get isRejected() {
		return this._isRejected;
	}

	/**
	 * Resolves the promise with the provided value.
	 *
	 * @param value
	 */
	public resolve(value: T) {
		if (!this._isFinished) {
			this._isFinished = true;
			this._isResolved = true;

			this._resolve(value);
		}
	}

	/**
	 * Rejects the promise, optionally with the given error.
	 *
	 * @param err
	 */
	public reject(err?: any) {
		if (!this._isFinished) {
			this._isFinished = true;
			this._isRejected = true;

			this._reject(err);
		}
	}

}
