// `setTimeout()` has a bug: it fires immediately
// when the interval is longer than about `24.85` days.
// https://stackoverflow.com/questions/3468607/why-does-settimeout-break-for-large-millisecond-delay-values
const SET_TIMEOUT_MAX_SAFE_INTERVAL = 2147483647
export default function getSafeTimeoutInterval(interval) {
  return Math.min(interval, SET_TIMEOUT_MAX_SAFE_INTERVAL)
}
