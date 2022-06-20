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

		expect(await timer.next()).to.equal(timerId1)
		timer.now().should.equal(0)

		triggered1.should.equal(true)
		triggered2.should.equal(false)

		expect(await timer.next()).to.equal(timerId2)
		timer.now().should.equal(100)

		triggered1.should.equal(true)
		triggered2.should.equal(true)

		expect(await timer.next()).to.be.undefined
		expect(await timer.next()).to.be.undefined
		timer.now().should.equal(100)
	})

	it('should trigger all scheduled functions', async function() {
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

		expect(await timer.end()).to.deep.equal([timerId1, timerId2])
		timer.now().should.equal(100)

		triggered1.should.equal(true)
		triggered2.should.equal(true)

		expect(await timer.end()).to.deep.equal([])
		expect(await timer.end()).to.deep.equal([])
		timer.now().should.equal(100)
	})

	it('should fast forward time', async function() {
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

		expect(await timer.fastForward(0)).to.deep.equal([timerId1])
		timer.now().should.equal(0)

		triggered1.should.equal(true)
		triggered2.should.equal(false)

		expect(await timer.fastForward(50)).to.deep.equal([])
		timer.now().should.equal(50)

		expect(await timer.fastForward(50)).to.deep.equal([timerId2])
		timer.now().should.equal(100)

		triggered1.should.equal(true)
		triggered2.should.equal(true)

		expect(await timer.fastForward(1000)).to.deep.equal([])
		timer.now().should.equal(1100)
	})
})