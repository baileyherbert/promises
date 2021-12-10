import { CancellationToken, CancellationTokenSource, Task } from '../../src/main';

describe('CancellationTokenSource', function() {
	it('can cancel with a timeout from the constructor', async function() {
		const source = new CancellationTokenSource(100);
		await Task.delay(60);
		expect(source.isCancellationRequested).toBe(false);
		await Task.delay(60);
		expect(source.isCancellationRequested).toBe(true);
	});

	it('provides and cancels a token', function() {
		const source = new CancellationTokenSource();
		expect(source.token).toBeInstanceOf(CancellationToken);
		expect(source.token.isCancellationRequested).toBe(false);
		source.cancel();
		expect(source.token.isCancellationRequested).toBe(true);
	});

	it('can create linked sources', function() {
		const source = new CancellationTokenSource();
		const linked = CancellationTokenSource.createLinked(source.token);

		source.cancel();
		expect(linked.token.isCancellationRequested).toBe(true);
	});
});
