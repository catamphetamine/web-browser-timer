export default class TestTimer {
	constructor() {
		this.idCounter = 0
		this.timers = []
		this._now = 0
	}

	schedule(func, delay) {
		this.idCounter++
		const id = this.idCounter
		const at = this.now() + delay
		this.timers.push({ id, func, at })
		return id
	}

	cancel(id) {
		this.timers = this.timers.filter(timer => timer.id !== id)
	}

	now() {
		return this._now
	}

	async skip(timeAmount) {
		this._now += timeAmount
		const timers = this.timers.filter(timer => timer.at <= this.now())
		for (const timer of timers) {
			const result = timer.func()
			if (result && typeof result.then === 'function') {
				await result
			}
		}
		this.timers = this.timers.filter(timer => !timers.includes(timer))
	}
}