import * as Main from '../src/main';

describe('main', function() {
	it('exports the expected items', function() {
		expect(typeof Main.CancellationToken).toBe('function');
		expect(typeof Main.CancellationTokenSource).toBe('function');
		expect(typeof Main.OperationCancelledError).toBe('function');
		expect(typeof Main.Progress).toBe('function');
		expect(typeof Main.PromiseCompletionSource).toBe('function');
		expect(typeof Main.PromiseTimeoutSource).toBe('function');
		expect(typeof Main.Task).toBe('function');
		expect(typeof Main.TaskStatus).toBe('object');
	})
});
