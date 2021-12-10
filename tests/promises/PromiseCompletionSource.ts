import { PromiseCompletionSource } from '../../src/main';

describe('PromiseCompletionSource', function() {
	it('resolves', function() {
		const source = new PromiseCompletionSource<boolean>();
		const fn = jest.fn();

		source.promise.then(fn);
		source.resolve(true);

		expect(fn).toHaveBeenLastCalledWith(true);
	});

	it('rejects', function() {
		const source = new PromiseCompletionSource<boolean>();
		const resolveFn = jest.fn();
		const rejectFn = jest.fn();

		source.promise.then(resolveFn, rejectFn);
		source.reject(false);

		expect(resolveFn).not.toHaveBeenCalled();
		expect(rejectFn).toHaveBeenLastCalledWith(false);
	});
});
