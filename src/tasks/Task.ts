import { Promisable } from '@baileyherbert/types';
import { CancellationToken } from '../cancellation/CancellationToken';
import { CancellationTokenSource, OperationCancelledError } from '../main';
import { PromiseCompletionSource } from '../promises/PromiseCompletionSource';
import { PromiseTimeoutSource } from '../promises/PromiseTimeoutSource';
import { TaskStatus } from './TaskStatus';

/**
 * This is a promise alternative that must be manually started, and can resolve to one of three different states:
 * resolved, rejected, and cancelled.
 */
export class Task<T = void> {

	/**
	 * The underlying action to execute.
	 */
	protected _action: TaskAction<T> | CancellableTaskAction<T>;

	/**
	 * The cancellation token if available.
	 */
	protected _token?: CancellationToken;

	/**
	 * The result after executing the action.
	 */
	protected _result?: T;

	/**
	 * The error after executing the action.
	 */
	protected _error?: any;

	/**
	 * The current status of the task.
	 */
	protected _status: TaskStatus = TaskStatus.Created;

	/**
	 * A list of callbacks waiting for completion.
	 */
	protected _waitingCallbacks = new Set<(status: TaskStatus) => void>();

	/**
	 * Constructs a new `Task` instance.
	 *
	 * @param action
	 */
	public constructor(action: TaskAction<T>);

	/**
	 * Constructs a new `Task` instance.
	 *
	 * @param action
	 * @param cancel
	 *   A cancellation token that can be used to cancel the task. Please note that the token is only used to detect
	 *   when the task is cancelled, you must manually pass it to the task's action and handle it yourself.
	 */
	public constructor(action: CancellableTaskAction<T>, cancel: CancellationToken);
	public constructor(action: TaskAction<T> | CancellableTaskAction<T>, cancel?: CancellationToken) {
		this._action = action;
		this._token = cancel;

		if (cancel !== undefined) {
			cancel.register(() => {
				this._status = TaskStatus.Cancelled;
			});
		}
	}

	/**
	 * Starts the task in the background.
	 *
	 * @param startDelayed
	 *   When `true`, the task will be scheduled to run on the next event loop tick (generally within a millisecond).
	 *   This will prevent a heavy synchronous task from interrupting the current event loop. Defaults to `false`.
	 */
	public start(startDelayed = false) {
		if (this.status === TaskStatus.Created) {
			const runner = async () => {
				this._status = TaskStatus.Running;

				/**
				 * Internal function to invoke callbacks.
				 */
				const complete = () => {
					for (const callback of this._waitingCallbacks) {
						callback(this.status);
					}
				};

				/**
				 * The resolve function to pass into the action.
				 */
				const resolve = (result: T) => {
					this._result = result;
					this._status = TaskStatus.Resolved;
					complete();
				};

				/**
				 * The reject function to pass into the action.
				 */
				const reject = (error?: any) => {
					this._error = error;
					this._status = TaskStatus.Rejected;
					complete();
				};

				try {
					await this._action(resolve, reject, this._token as any);
				}
				catch (error) {
					if (error instanceof OperationCancelledError) {
						// Do nothing, state will be updated automatically
					}
					else {
						reject(error);
					}
				}
			};

			this._status = TaskStatus.Scheduled;
			startDelayed ? setTimeout(runner, 0) : runner();

			return this;
		}

		throw new Error('Cannot start a task that has already been started or cancelled');
	}

	/**
	 * Returns a promise which waits for the task to complete.
	 */
	public wait(): Promise<void>;

	/**
	 * Returns a promise which waits for the task to complete, but will be cancelled after the given duration.
	 *
	 * @param duration
	 *   The number of milliseconds to wait for completion before timing out. Setting this to `-1` will wait infinitely.
	 *
	 * @returns
	 *   A promise which resolves to `true` if the task executed or `false` if timed out.
	 */
	public wait(duration?: number): Promise<boolean>;

	/**
	 * Returns a promise which waits for the task to complete, but will resolve immediately if the given cancellation
	 * token is canceled before the task completes.
	 *
	 * @param token
	 *
	 * @returns
	 *   A promise which resolves to `true` if the task executed or `false` if the cancellation token was triggered.
	 */
	public wait(token: CancellationToken): Promise<boolean>;
	public wait(arg?: number | CancellationToken): Promise<any> {
		const source = new PromiseCompletionSource<any>();
		let timeout: PromiseTimeoutSource | undefined;
		let listener: (() => void) | undefined;

		if (typeof arg === 'number' && arg >= 0) {
			timeout = new PromiseTimeoutSource(arg, () => {
				source.resolve(false);
			});
		}

		else if (arg instanceof CancellationToken) {
			listener = () => {
				source.resolve(false);
			};

			arg.once('canceled', listener);
		}

		this.then(() => {
			timeout?.cancel();

			if (listener && arg instanceof CancellationToken) {
				arg.removeListener('canceled', listener);
			}

			source.resolve(true);
		});

		return source.promise;
	}

	/**
	 * The result of the task. Attempting to retrieve this value when the task has not resolved will result in an error.
	 */
	public get result() {
		if (!this.isResolved) {
			throw new Error('Cannot get the result of an unsuccessful or incomplete task');
		}

		return this._result as T;
	}

	/**
	 * The error thrown by the task.  Attempting to retrieve this value when the task has not rejected will result in
	 * an error.
	 */
	public get error() {
		if (!this.isRejected) {
			throw new Error('Cannot get the error of a successful or incomplete task');
		}

		return this._error;
	}

	/**
	 * The current status of the task.
	 */
	public get status() {
		return this._status;
	}

	/**
	 * Whether the task has finished (resolved, rejected, or canceled).
	 */
	public get isCompleted() {
		return this.status >= TaskStatus.Cancelled;
	}

	/**
	 * Whether the task has resolved successfully.
	 */
	public get isResolved() {
		return this.status === TaskStatus.Resolved;
	}

	/**
	 * Whether the task has rejected with an error.
	 */
	public get isRejected() {
		return this.status === TaskStatus.Rejected;
	}

	/**
	 * Whether the task has been cancelled.
	 */
	public get isCancelled() {
		return this.status === TaskStatus.Cancelled;
	}

	/**
	 * Runs the given asynchronous action and returns a `Task` to track it. The task will be started automatically
	 * before it is returned.
	 *
	 * @param action An asynchronous function that will perform the task.
	 * @returns The task instance used to track the action.
	 */
	public static run<T>(action: TaskAction<T>): Task<T> {
		const task = new this(action);
		return task.start();
	}

	/**
	 * Returns a task that completes after the specified delay.
	 *
	 * @param duration
	 */
	public static delay(duration: number) {
		return new Task<void>((resolve) => {
			setTimeout(resolve, duration);
		}).start();
	}

	/**
	 * Invokes the callback when the task completes. The status of the task will be returned.
	 *
	 * This will not throw an error or return the resolved value. You'll need to compare the task's status or use its
	 * properties to get that information.
	 *
	 * @param callback
	 * @returns
	 */
	public then(callback: (status: TaskStatus) => void) {
		if (this.isCompleted) {
			callback(this.status);
			return;
		}

		this._waitingCallbacks.add(callback);
	}

}

export type TaskResolve<T> = (result: T) => void;
export type TaskReject = (error?: any) => void;

export type TaskAction<T> = (
	this: Task<T>,
	resolve: TaskResolve<T>,
	reject: TaskReject
) => Promisable<T>;

export type CancellableTaskAction<T> = (
	this: Task<T>,
	resolve: TaskResolve<T>,
	reject: TaskReject,
	token: CancellationToken
) => Promisable<T>;
