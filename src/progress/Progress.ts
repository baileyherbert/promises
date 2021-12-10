import { EventEmitter } from '@baileyherbert/events';

export class Progress<T> extends EventEmitter<ProgressEvents<T>> {

	/**
	 * Reports new progress.
	 *
	 * @param progress
	 */
	public report(progress: T) {
		this.emit('progress', progress);
	}

}

type ProgressEvents<T> = {
	progress: [progress: T];
}
