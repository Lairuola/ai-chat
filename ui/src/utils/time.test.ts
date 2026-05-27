import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { dateGroupLabel, formatRelativeTime } from './time'

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-05-27T12:00:00'))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('formatRelativeTime', () => {
  it('不到1分钟显示"刚刚"', () => {
    expect(formatRelativeTime(Date.now() - 30_000)).toBe('刚刚')
  })

  it('不到1小时显示分钟前', () => {
    expect(formatRelativeTime(Date.now() - 5 * 60_000)).toBe('5 分钟前')
  })

  it('当天显示 HH:MM', () => {
    const today = new Date('2026-05-27T08:15:00').getTime()
    expect(formatRelativeTime(today)).toBe('08:15')
  })

  it('非当天显示 M/D', () => {
    const yesterday = new Date('2026-05-26T14:30:00').getTime()
    expect(formatRelativeTime(yesterday)).toBe('5/26')
  })

  it('边缘情况：恰好 1 分钟', () => {
    expect(formatRelativeTime(Date.now() - 60_000)).toBe('1 分钟前')
  })

  it('边缘情况：恰好 1 小时', () => {
    const d = new Date('2026-05-27T11:00:00').getTime()
    expect(formatRelativeTime(d)).toBe('11:00')
  })
})

describe('dateGroupLabel', () => {
  it('今天', () => {
    const d = new Date('2026-05-27T10:00:00').getTime()
    expect(dateGroupLabel(d)).toBe('今天')
  })

  it('昨天', () => {
    const d = new Date('2026-05-26T10:00:00').getTime()
    expect(dateGroupLabel(d)).toBe('昨天')
  })

  it('近7天', () => {
    const d = new Date('2026-05-21T10:00:00').getTime()
    expect(dateGroupLabel(d)).toBe('近7天')
  })

  it('近30天', () => {
    const d = new Date('2026-05-01T10:00:00').getTime()
    expect(dateGroupLabel(d)).toBe('近30天')
  })

  it('更早', () => {
    const d = new Date('2026-04-01T10:00:00').getTime()
    expect(dateGroupLabel(d)).toBe('2026年4月1日')
  })

  it('short 模式返回"更早"', () => {
    const d = new Date('2026-04-01T10:00:00').getTime()
    expect(dateGroupLabel(d, true)).toBe('更早')
  })
})
