import {
	Timer,
	TestTimer
} from '../index.js'
// } from 'web-browser-timer'

describe('exports', function() {
	it('should export stuff', function() {
		Timer.should.be.a('function')
		TestTimer.should.be.a('function')
	})
})