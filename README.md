# `web-browser-timer`

A wrapper around `setTimeout`/`clearTimeout` for better API interface and testing.

Also it fixes `setTimeout`'s [bug](https://stackoverflow.com/questions/3468607/why-does-settimeout-break-for-large-millisecond-delay-values) when it fires the callback immediately if the delay is larger than about 28 days.

## Install

```
npm install web-browser-timer --save
```

## Use

### Browser

```js
import { Timer } from 'web-browser-timer'

const timer = new Timer()

// Analogous to `setTimeout()`.
const timerId = timer.schedule(func, delay)

// Analogous to `clearTimeout()`.
timer.cancel(timerId)

// Analogous to `Date.now()`.
timer.now()
```

### Stub

`TestTimer` could be used in place of `Timer` in tests.

```js
import { TestTimer } from 'web-browser-timer'

const timer = new TestTimer()

let triggered = false
const timerId = timer.schedule(() => triggered = true, 100)

// Skip the time and trigger the next closest scheduled function.
// If there was any scheduled function, returns a triggered timer ID.
// Otherwise, returns `undefined`.
await timer.next() === timerId
triggered === true
await timer.next() === undefined

// In cases when there're no scheduled functions,
// to skip a certain amount of time, use this technique:
timer.schedule(() => {}, timeAmount)
await timer.next()
```

## Test

```
npm test
```

## GitHub Ban

On March 9th, 2020, GitHub, Inc. silently [banned](https://medium.com/@catamphetamine/how-github-blocked-me-and-all-my-libraries-c32c61f061d3) my account (erasing all my repos, issues and comments) without any notice or explanation. Because of that, all source codes had to be promptly moved to GitLab. The [GitHub repo](https://github.com/catamphetamine/web-browser-timer) is now only used as a backup (you can star the repo there too), and the primary repo is now the [GitLab one](https://gitlab.com/catamphetamine/web-browser-timer). Issues can be reported in any repo.

## License

[MIT](LICENSE)