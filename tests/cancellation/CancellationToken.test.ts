import { CancellationTokenSource, OperationCancelledError, Task } from '../../src/main';

describe('CancellationToken', function() {
	it('throws exceptions', function() {
		const { token } = new CancellationTokenSource(0);
		expect(() => token.throwIfCancellationRequested()).toThrowError(OperationCancelledError);
	});

	it('allows registering callbacks', function() {
		const { token } = new CancellationTokenSource(0);
		const fn = jest.fn();

		token.register(fn);
		expect(fn).toHaveBeenCalled();
	});

	it('works asynchronously', async function() {
		const source = new CancellationTokenSource();
		const token = source.token;
		const fn = jest.fn();

		token.register(fn);

		expect(() => token.throwIfCancellationRequested()).not.toThrow();
		expect(fn).not.toHaveBeenCalled();

		await Task.delay(100);
		source.cancel();

		expect(() => token.throwIfCancellationRequested()).toThrowError(OperationCancelledError);
		expect(fn).toHaveBeenCalled();
	});
});
