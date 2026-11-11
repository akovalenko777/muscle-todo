export const lpad = (n: number): string => n < 10 ? '0' + n : '' + n;

export const dateStr = (d: Date): string => Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Kyiv' }).format(d);

export const dateOnly = (d: Date): Date => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Kyiv',
    year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(d)
  const map = Object.fromEntries(parts.map(p => [p.type, p.value]))
  return new Date(Date.UTC(Number(map.year), Number(map.month) - 1, Number(map.day)))
}

export const groupBy = <T>(list: T[], byField: (t: T) => string) => {
  const grouped: Record<string, T[]> = {}
  list.forEach((t) => {
    const key = byField(t)
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(t)
  })
  return grouped
}