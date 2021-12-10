import { Progress } from '../../src/main';

describe('Progress', function() {
	it('emits progress events', function() {
		const progress = new Progress<number>();
		const results = new Array<number>();

		progress.on('progress', progress => results.push(progress));

		progress.report(50);
		progress.report(100);

		expect(results).toEqual([50, 100]);
	});
});
