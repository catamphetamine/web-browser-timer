export default class TestTimer {
	constructor() {
		this.idCounter = 0
		this.timers = []
		this._now = 0
	}

	schedule(func, delay) {
		return this._schedule(func, delay, 'setTimeout')
	}

	// `type` argument is used to mark a new `timer` object in a certain way.
	// `type` argument is only used to tell `.waitFor()` timer from `.schedule()` ones:
	// `.waitFor()` timers don't work with `.fastForward()`.
	_schedule(func, delay, type) {
		if (delay < 0) {
			throw new Error('[web-browser-timer] A `delay` can\'t be negative')
		}
		this.idCounter++
		const id = this.idCounter
		const at = this.now() + delay
		this.timers.push({ id, func, at, type })
		// Sort scheduled functions by closest ones first.
		this.timers.sort((a, b) => a.at - b.at)
		if (this._onSchedule) {
			this._onSchedule()
		}
		return id
	}

	cancel(id) {
		this.timers = this.timers.filter(timer => timer.id !== id)
	}

	now() {
		return this._now
	}

	waitFor(delay) {
		return new Promise(resolve => {
			const id = this._schedule(() => resolve(id), delay, 'waitFor')
		})
	}

	async _trigger(timer) {
		return await new Promise((resolve) => {
			this._now = timer.at
			this._onSchedule = () => {
				this._onSchedule = undefined
				resolve(timer.id)
			}
			const result = timer.func()
			// The function may have scheduled another timer,
			// so `await` for it to finish.
			if (result && typeof result.then === 'function') {
				result.then(() => resolve(timer.id))
			} else {
				resolve(timer.id)
			}
		})
	}

	_getNextTimer() {
		const nextTimer = this.timers.shift()
		if (nextTimer.type === 'waitFor') {
			throw new Error('It has been detected that your code uses `timer.waitFor()`. The thing is, `timer.waitFor()` doesn\'t work with `timer.fastForward()` or `timer.fastForwardToLast()` or `timer.next()`, so you can\'t call those functions when using `timer.waitFor()` in your code. That\'s due to the intricacies of how `async`/`await` or `Promise` works. And there\'s no workaround for this. And don\'t attempt to write your own `waitFor()` function — it wouldn\'t work either.')
		}
		return nextTimer
	}

	async next() {
		if (this.timers.length > 0) {
			return await this._trigger(this._getNextTimer())
		}
	}

	async fastForwardToLast() {
		const timerId = await this.next()
		if (timerId) {
			return [timerId].concat(await this.fastForwardToLast())
		}
		return []
	}

	async fastForward(timeAmount) {
		if (timeAmount < 0) {
			throw new Error('[web-browser-timer] A `delay` can\'t be negative')
		}
		if (this.timers.length === 0) {
			this._now += timeAmount
			return []
		}
		const [timer] = this.timers
		const delay = timer.at - this.now()
		if (delay > timeAmount) {
			this._now += timeAmount
			return []
		}
		const timerId = await this._trigger(this._getNextTimer())
		return [timerId].concat(await this.fastForward(timeAmount - delay))

		// Triggering the timer above might have triggered `setTimeout()` timers
		// which might have called `resolve()` functions of `new Promise()`s.
		// But resolving a `Promise` doesn't call its `.then()` right away.
		// Instead, it waits for another cycle of the "event loop".
		//
		// Initially, I thought that pushing the "event loop" into the next cycle
		// via somethign like `setTimeout(..., 0)` would "unstuck" it, but then
		// I figured that even if it does "unstuck" it once, any subsequent
		// `async`/`await` calls down the line would "re-stuck" it again,
		// so seems like `timer.fastForward()` doesn't work too well with `Promise`s.
		//
		// Possible workarounds:
		// * Not using `Promise`s, and, therefore, not using `timer.waitFor()`.
		// * Calling `timer.fastForward()` repeatedly until any pending `Promise`s are finished.
		//
		// return new Promise((resolve) => {
		// 	setTimeout(() => {
		// 		resolve([timerId].concat(await this.fastForward(timeAmount - delay)))
		// 	}, 0)
		// })
	}
}