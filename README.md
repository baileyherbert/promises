# Promises

This is a small collection of promise-based utilities.

```
npm install @baileyherbert/promises
```

## Documentation

### `PromiseCompletionSource`

This class allows you to create a `Promise` which can easily be resolved or rejected on demand from the outside.

```ts
import { PromiseCompletionSource } from '@baileyherbert/promises';

function runFakeTask() {
	const source = new PromiseCompletionSource();

	// Resolves the promise after 5 seconds
	setTimeout(() => {
		source.resolve();
	}, 5000);

	// Returns the promise object
	return source.promise;
}

// Resolves after 5 seconds
await runFakeTask();
```

### `PromiseTimeoutSource`

This class creates a promise that resolves to a boolean after the specified time, but can be cancelled prematurely. The boolean is `true` if the timeout was triggered, or `false` if cancelled.

You can also specify a custom `action` to execute when the timeout is reached.

```ts
import { PromiseTimeoutSource } from '@baileyherbert/promises';
```

**Example 1:** Wait for 30 seconds

```ts
await new PromiseTimeoutSource(30000);
```

**Example 2:** Run a task after 30 seconds

```ts
new PromiseTimeoutSource(30000, () => {
	console.log('This runs after 30 seconds!');
});
```

**Example 3:** Cancel a task before it's scheduled to run

```ts
const timeout = new PromiseTimeoutSource(30000, () => {
	console.log('This runs after 30 seconds!');
});

// The action will never run because it gets cancelled after 15 sec!
setTimeout(() => timeout.cancel(), 15000);

// Confirm that it was cancelled
const result = await timeout;
console.log('The timeout was', result ? 'fulfilled' : 'cancelled');
```

You could use this to cancel and clean up an operation after a specified amount of time, but stop the cancellation
task from running if it completes in time.

### `Task`

This is a promise alternative that must be manually started, and can be cancelled. It's very similar to C#'s tasks.

```ts
import { Task } from '@baileyherbert/promises';

const task = new Task((resolve, reject) => {
	resolve();
});

// Tell the task when to start
task.start();

// Wait for the task to finish
await task;

// You can also wait with a timeout
if (!await task.wait(10000)) {
	// Timed out
}

// Get the resolved value
if (task.isResolved) {
	const taskResult = task.result;
}
```

You can combine this with a `CancellationToken` to make the task cancellable.

```ts
const source = new CancellationTokenSource();
const token = source.token;
const task = new Task(async (resolve, reject, cancel) => {
	for (let i = 0; i < 100; i++) {
		await Task.delay(100);
		cancel.throwIfCancellationRequested();
	}
}, token);

if (await task === TaskStatus.Cancelled) {
	// It was cancelled!
}
```
