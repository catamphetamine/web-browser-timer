import TestTimer from './TestTimer.js';

describe('TestTimer', function() {
	it('should implement TestTimer interface', function() {
		const timer = new TestTimer()

		timer.now().should.equal(0)

		const timerId = timer.schedule(() => {})
		timerId.should.be.a('number')

		timer.cancel(timerId)
	})

	it('should skip time', async function() {
		const timer = new TestTimer()

		timer.now().should.equal(0)

		let triggered1 = false
		let triggered2 = false

		const timerId1 = timer.schedule(() => {
			triggered1 = true
		}, 0)

		const timerId2 = timer.schedule(async () => {
			await new Promise((resolve) => setTimeout(resolve, 100))
			triggered2 = true
		}, 100)

		triggered1.should.equal(false)
		triggered2.should.equal(false)

		await timer.skip(0)

		triggered1.should.equal(true)
		triggered2.should.equal(false)

		await timer.skip(100)

		triggered1.should.equal(true)
		triggered2.should.equal(true)
	})
})