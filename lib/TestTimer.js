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
			const id = this.schedule(() => resolve(id), delay)
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

	async next() {
		if (this.timers.length > 0) {
			return await this._trigger(this.timers.shift())
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
		const timerId = await this._trigger(this.timers.shift())
		return [timerId].concat(await this.fastForward(timeAmount - delay))
	}
}