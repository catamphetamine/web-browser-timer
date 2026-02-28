import { describe, it } from 'mocha'
import { expect } from 'chai'

import TestTimer from './TestTimer.js';

describe('TestTimer', function() {
	it('should implement TestTimer interface', function() {
		const timer = new TestTimer()

		expect(timer.now()).to.equal(0)

		const timerId = timer.schedule(() => {})
		expect(timerId).to.be.a('number')

		timer.cancel(timerId)
	})

	it('should skip time', async function() {
		const timer = new TestTimer()

		expect(timer.now()).to.equal(0)

		let triggered1 = false
		let triggered2 = false

		const timerId1 = timer.schedule(() => {
			triggered1 = true
		}, 0)

		const timerId2 = timer.schedule(async () => {
			await new Promise((resolve) => setTimeout(resolve, 100))
			triggered2 = true
		}, 100)

		expect(triggered1).to.equal(false)
		expect(triggered2).to.equal(false)

		expect(await timer.next()).to.equal(timerId1)
		expect(timer.now()).to.equal(0)

		expect(triggered1).to.equal(true)
		expect(triggered2).to.equal(false)

		expect(await timer.next()).to.equal(timerId2)
		expect(timer.now()).to.equal(100)

		expect(triggered1).to.equal(true)
		expect(triggered2).to.equal(true)

		expect(await timer.next()).to.be.undefined
		expect(await timer.next()).to.be.undefined
		expect(timer.now()).to.equal(100)
	})

	it('should trigger all scheduled functions', async function() {
		const timer = new TestTimer()

		expect(timer.now()).to.equal(0)

		let triggered1 = false
		let triggered2 = false

		const timerId1 = timer.schedule(() => {
			triggered1 = true
		}, 0)

		const timerId2 = timer.schedule(async () => {
			await new Promise((resolve) => setTimeout(resolve, 100))
			triggered2 = true
		}, 100)

		expect(triggered1).to.equal(false)
		expect(triggered2).to.equal(false)

		expect(await timer.fastForwardToLast()).to.deep.equal([timerId1, timerId2])
		expect(timer.now()).to.equal(100)

		expect(triggered1).to.equal(true)
		expect(triggered2).to.equal(true)

		expect(await timer.fastForwardToLast()).to.deep.equal([])
		expect(await timer.fastForwardToLast()).to.deep.equal([])
		expect(timer.now()).to.equal(100)
	})

	it('should fast forward time', async function() {
		const timer = new TestTimer()

		expect(timer.now()).to.equal(0)

		let triggered1 = false
		let triggered2 = false

		const timerId1 = timer.schedule(() => {
			triggered1 = true
		}, 0)

		const timerId2 = timer.schedule(async () => {
			await new Promise((resolve) => setTimeout(resolve, 100))
			triggered2 = true
		}, 100)

		expect(triggered1).to.equal(false)
		expect(triggered2).to.equal(false)

		expect(await timer.fastForward(0)).to.deep.equal([timerId1])
		expect(timer.now()).to.equal(0)

		expect(triggered1).to.equal(true)
		expect(triggered2).to.equal(false)

		expect(await timer.fastForward(50)).to.deep.equal([])
		expect(timer.now()).to.equal(50)

		expect(await timer.fastForward(50)).to.deep.equal([timerId2])
		expect(timer.now()).to.equal(100)

		expect(triggered1).to.equal(true)
		expect(triggered2).to.equal(true)

		expect(await timer.fastForward(1000)).to.deep.equal([])
		expect(timer.now()).to.equal(1100)
	})

	it('should fast forward time when timers are scheduled inside scheduled timers (fast forward one after another)', async function() {
		const timer = new TestTimer()

		expect(timer.now()).to.equal(0)

		let triggered1 = false
		let triggered2 = false

		let timerId1
		let timerId2

		let timerWaitId1
		let timerWaitId2

		timerId1 = timer.schedule(async () => {
			triggered1 = true
			timerWaitId1 = await timer.waitFor(50)

			timerId2 = timer.schedule(async () => {
				timerWaitId2 = await timer.waitFor(50)
				triggered2 = true
			}, 50)
		}, 0)

		expect(triggered1).to.equal(false)
		expect(triggered2).to.equal(false)

		expect(await timer.fastForward(10)).to.deep.equal([timerId1])
		expect(timer.now()).to.equal(10)

		expect(triggered1).to.equal(true)
		expect(triggered2).to.equal(false)

		expect(await timer.fastForward(50)).to.deep.equal([timerWaitId1])
		expect(timer.now()).to.equal(60)

		expect(triggered1).to.equal(true)
		expect(triggered2).to.equal(false)

		expect(await timer.fastForward(50)).to.deep.equal([timerId2])
		expect(timer.now()).to.equal(110)

		expect(triggered1).to.equal(true)
		expect(triggered2).to.equal(false)

		expect(await timer.fastForward(50)).to.deep.equal([timerWaitId2])
		expect(timer.now()).to.equal(160)

		expect(triggered1).to.equal(true)
		expect(triggered2).to.equal(true)
	})

	it('should fast forward time when timers are scheduled inside scheduled timers (fast forward all)', async function() {
		const timer = new TestTimer()

		expect(timer.now()).to.equal(0)

		let triggered1 = false
		let triggered2 = false

		let timerId1
		let timerId2

		let timerWaitId1
		let timerWaitId2

		timerId1 = timer.schedule(async () => {
			triggered1 = true
			timerWaitId1 = await timer.waitFor(50)

			timerId2 = timer.schedule(async () => {
				timerWaitId2 = await timer.waitFor(50)
				triggered2 = true
			}, 50)
		}, 0)

		expect(triggered1).to.equal(false)
		expect(triggered2).to.equal(false)

		expect(await timer.fastForward(150)).to.deep.equal([timerId1, timerWaitId1, timerId2, timerWaitId2])
		expect(timer.now()).to.equal(150)

		expect(triggered1).to.equal(true)
		expect(triggered2).to.equal(true)
	})
})