type OnChangeListener = (key: string, value?: any, prevValue?: any) => void;

export type TimerId = number;

export interface ITimer {
	schedule(func: () => void, delay: number): TimerId;
	cancel(timerId: TimerId): void;
	now(): number;
}

interface Timer extends ITimer {}
export class Timer {}

interface TestTimer extends ITimer {}
export class TestTimer {
  async next(): TimerId | undefined;
}