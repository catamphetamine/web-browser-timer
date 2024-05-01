type OnChangeListener = (key: string, value?: any, prevValue?: any) => void;

export type TimerId = number;

export interface ITimer {
	schedule(func: () => void, delay: number): TimerId;
	cancel(timerId: TimerId): void;
	now(): number;
	waitFor(delay: number): Promise<void>;
}

interface Timer extends ITimer {}
export class Timer {}

interface TestTimer extends ITimer {}
export class TestTimer {
  constructor(parameters: {
    log: (...args: any[]) => void
  });
  next(): Promise<TimerId | undefined>;
  fastForward(timeAmount: number): Promise<TimerId[]>;
  fastForwardToLast(): Promise<TimerId[]>;
}