export default class TestTimer {
	constructor() {
		this.idCounter = 0
		this.timers = []
		this._now = 0
	}

	schedule(func, delay) {
		if (delay < 0) {
			throw new Error('[web-browser-timer] A `delay` can\'t be negative')
		}
		this.idCounter++
		const id = this.idCounter
		const at = this.now() + delay
		this.timers.push({ id, func, at })
		// Sort scheduled functions by closest ones first.
		this.timers.sort((a, b) => a.at - b.at)
		return id
	}

	cancel(id) {
		this.timers = this.timers.filter(timer => timer.id !== id)
	}

	now() {
		return this._now
	}

	async next() {
		if (this.timers.length === 0) {
			return
		}
		const timer = this.timers.shift()
		this._now = timer.at
		const result = timer.func()
		if (result && typeof result.then === 'function') {
			await result
		}
		return timer.id
	}
}