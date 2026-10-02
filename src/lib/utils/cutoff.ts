import { format, isBefore, isAfter, set, startOfDay, addDays, getDay, isSameDay } from 'date-fns'
import { toZonedTime, formatInTimeZone } from 'date-fns-tz'

const TIMEZONE = 'Europe/Rome'

/**
 * Checks if ordering is currently open for a specific delivery date.
 */
export function isOrderingOpen(
  deliveryDate: Date | string,
  cutoffTimeStr: string, // format HH:mm
  mondayCutoffOnSaturday: boolean
): boolean {
  const now = toZonedTime(new Date(), TIMEZONE)
  const targetDate = toZonedTime(new Date(deliveryDate), TIMEZONE)
  const [hours, minutes] = cutoffTimeStr.split(':').map(Number)

  // Cutoff is normally the day before at the specified time
  let cutoffDate = set(addDays(targetDate, -1), { hours, minutes, seconds: 0, milliseconds: 0 })

  // If target is Monday and setting is enabled, cutoff is on Saturday
  if (getDay(targetDate) === 1 && mondayCutoffOnSaturday) { // 1 = Monday
    cutoffDate = set(addDays(targetDate, -2), { hours, minutes, seconds: 0, milliseconds: 0 }) // Saturday
  }

  return isBefore(now, cutoffDate)
}

/**
 * Returns a list of available upcoming delivery dates.
 */
export function getAvailableDeliveryDates(
  deliveryWeekdays: number[], // 1=Mon, 7=Sun
  closedDaysDates: Date[],
  cutoffTimeStr: string,
  mondayCutoffOnSaturday: boolean,
  maxDays: number = 5
): Date[] {
  const available: Date[] = []
  let currentDate = toZonedTime(new Date(), TIMEZONE)
  // Check up to 30 days ahead to find maxDays valid ones
  
  for (let i = 0; i < 30; i++) {
    const candidateDate = startOfDay(addDays(currentDate, i))
    
    // Check if it's a delivery day
    const dayOfWeek = getDay(candidateDate) // 0=Sun, 1=Mon...
    const normalizedDay = dayOfWeek === 0 ? 7 : dayOfWeek
    
    if (!deliveryWeekdays.includes(normalizedDay)) continue

    // Check if it's a closed day
    const isClosed = closedDaysDates.some(closedDay => isSameDay(closedDay, candidateDate))
    if (isClosed) continue

    // Check if ordering is still open for this day
    if (isOrderingOpen(candidateDate, cutoffTimeStr, mondayCutoffOnSaturday)) {
      available.push(candidateDate)
    }

    if (available.length >= maxDays) break
  }

  return available
}

/**
 * Checks if order cancellation is allowed.
 * Cancellation is allowed on the day of delivery up until cancelUntilTime.
 */
export function isCancellationOpen(
  deliveryDate: Date | string,
  cancelUntilTimeStr: string // format HH:mm
): boolean {
  const now = toZonedTime(new Date(), TIMEZONE)
  const targetDate = toZonedTime(new Date(deliveryDate), TIMEZONE)
  const [hours, minutes] = cancelUntilTimeStr.split(':').map(Number)

  const cancelDeadline = set(targetDate, { hours, minutes, seconds: 0, milliseconds: 0 })

  return isBefore(now, cancelDeadline)
}

/**
 * Checks if modifications are open (same logic as ordering).
 */
export function isModificationOpen(
  deliveryDate: Date | string,
  cutoffTimeStr: string,
  mondayCutoffOnSaturday: boolean
): boolean {
  return isOrderingOpen(deliveryDate, cutoffTimeStr, mondayCutoffOnSaturday)
}

export function isCutoffPassed(
  deliveryDate: Date | string,
  cutoffTimeStr: string = '14:00',
  mondayCutoffOnSaturday: boolean = true
): boolean {
  return !isOrderingOpen(deliveryDate, cutoffTimeStr, mondayCutoffOnSaturday)
}

