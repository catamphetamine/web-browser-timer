import getSafeTimeoutInterval from './getSafeTimeoutInterval.js'

export default class Timer {
	schedule(func, delay) {
		if (delay < 0) {
			throw new Error('[web-browser-timer] A `delay` can\'t be negative')
		}
		return setTimeout(func, getSafeTimeoutInterval(delay))
	}

	cancel(id) {
		clearTimeout(id)
	}

	now() {
		return Date.now()
	}

	waitFor(delay) {
		return new Promise(resolve => this.schedule(resolve, delay))
	}
}