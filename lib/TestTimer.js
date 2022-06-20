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

	async _trigger(timer) {
		this._now = timer.at
		const result = timer.func()
		// The function may have scheduled another timer,
		// so `await` for it to finish.
		if (result && typeof result.then === 'function') {
			await result
		}
		return timer.id
	}

	async next() {
		if (this.timers.length === 0) {
			return
		}
		return await this._trigger(this.timers.shift())
	}

	async end() {
		const timerId = await this.next()
		if (timerId) {
			return [timerId].concat(await this.end())
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
		const timerId = await this._trigger(this.timers.shift())
		return [timerId].concat(await this.fastForward(timeAmount - delay))
	}
}