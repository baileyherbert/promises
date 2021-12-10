/**
 * Describes the current status of a task.
 */
export enum TaskStatus {
	/**
	 * The task has been initialized but not yet scheduled.
	 */
	Created = 0,

	/**
	 * The task has been scheduled for execution but has not yet begun executing.
	 */
	Scheduled = 2,

	/**
	 * The task is running but has not yet completed.
	 */
	Running = 3,

	/**
	 * The task was cancelled prematurely.
	 */
	Cancelled = 5,

	/**
	 * The task was resolved to a value.
	 */
	Resolved = 6,

	/**
	 * The task rejected with an error.
	 */
	Rejected = 7,
}
