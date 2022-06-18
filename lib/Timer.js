import getSafeTimeoutInterval from './getSafeTimeoutInterval.js'

export default class Timer {
	schedule(func, delay) {
		return setTimeout(func, getSafeTimeoutInterval(delay))
	}

	cancel(id) {
		clearTimeout(id)
	}

	now() {
		return Date.now()
	}
}