export function formatRelativeTime(ts: number): string {
  const now = Date.now()
  const diff = now - ts
  if (diff < 60_000)
    return '刚刚'
  if (diff < 3600_000)
    return `${Math.floor(diff / 60_000)} 分钟前`
  const d = new Date(ts)
  if (d.toDateString() === new Date().toDateString())
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export function dateGroupLabel(ts: number, short?: boolean): string {
  const d = new Date(ts)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)

  if (d.toDateString() === now.toDateString())
    return '今天'
  if (diffDays === 1)
    return '昨天'
  if (diffDays <= 7)
    return '近7天'
  if (diffDays <= 30)
    return '近30天'
  return short ? '更早' : `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}
