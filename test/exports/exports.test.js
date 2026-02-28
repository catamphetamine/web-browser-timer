import { describe, it } from 'mocha'
import { expect } from 'chai'

import {
	Timer,
	TestTimer
} from 'web-browser-timer'

describe('exports', function() {
	it('should export stuff', function() {
		expect(Timer).to.be.a('function')
		expect(TestTimer).to.be.a('function')
	})
})