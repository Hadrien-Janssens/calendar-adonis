import OpeningHour from '#models/opening_hour'
import Service from '#models/service'
import { inject } from '@adonisjs/core'
import { GoogleCalendarService } from './google_calendar_service.js'
import { DateTime, Interval } from 'luxon'
import { BookingService } from './booking_service.js'

type Data = {
  date: string
  availableSlots: {
    start: string
    end: string
  }[]
}[]

type MonthAvailabilityResult =
  | { ok: true; data: Data }
  | { ok: false; error: 'INVALID_FORMAT' | 'PAST_MONTH' }

@inject()
export class AvailabilitySlotService {
  constructor(
    protected googleService: GoogleCalendarService,
    protected bookingService: BookingService
  ) {}

  public async getMonthAvailability(
    date: string,
    serviceId: number
  ): Promise<MonthAvailabilityResult> {
    const ZONE = 'Europe/Brussels'
    const service = await Service.findOrFail(serviceId)
    const serviceDuration = service.durationMinutes
    const openingHours = await OpeningHour.all()
    const events = await this.googleService.listEvents()

    // TODO: recupérer les events Google que ceux du mois ;)
    // TODO: vérifier que le mois est correct, mais pas le vérifier dans le service, le verifier dans le controleur via un validateur par exemple

    const currentDate = DateTime.fromISO(date, { zone: ZONE })
    const monthStart = currentDate.startOf('month')
    if (!monthStart.isValid) {
      return { ok: false, error: 'INVALID_FORMAT' }
    }

    //early return for only return futur or current month but never previous month
    if (currentDate.startOf('month') < DateTime.now().setZone(ZONE).startOf('month')) {
      return { ok: false, error: 'PAST_MONTH' }
    }

    const isTheCurrentMonth =
      currentDate.month === DateTime.now().month && currentDate.year === DateTime.now().year
    let today = 0
    if (isTheCurrentMonth) {
      today = DateTime.now().day - 1
    }

    const daysInMonth = monthStart.daysInMonth
    const results = []

    for (let i = today; i < daysInMonth; i++) {
      const currentDay = monthStart.plus({ days: i })
      const schedule = openingHours.find((oh) => oh.weekday === currentDay.weekday)

      if (!schedule) continue

      // 2. Créer les limites de la journée dans la bonne zone
      const dayStart = currentDay.set({
        hour: Number.parseInt(schedule.opens_at.split(':')[0]),
        minute: Number.parseInt(schedule.opens_at.split(':')[1]),
        second: 0,
        millisecond: 0,
      })
      const dayEnd = currentDay.set({
        hour: Number.parseInt(schedule.closes_at.split(':')[0]),
        minute: Number.parseInt(schedule.closes_at.split(':')[1]),
        second: 0,
        millisecond: 0,
      })

      const dayInterval = Interval.fromDateTimes(dayStart, dayEnd)

      // 3. Filtrer et convertir les événements Google
      const busyGoogleIntervals = events
        .filter((e) => e.transparency !== 'transparent')
        .map((e) => {
          if (e.start.dateTime) {
            return Interval.fromDateTimes(
              DateTime.fromISO(e.start.dateTime, { setZone: true }),
              DateTime.fromISO(e.end.dateTime, { setZone: true })
            )
          } else {
            // Événement all-day :
            return Interval.fromDateTimes(
              DateTime.fromISO(e.start.date, { zone: ZONE }).startOf('day'),
              DateTime.fromISO(e.end.date, { zone: ZONE }).startOf('day')
            )
          }
        })
        .filter((int: Interval) => int.overlaps(dayInterval))

      const monthBookings = await this.bookingService.getBookingsByMonth(currentDate)
      const busyBookingInterval = monthBookings.map((booking) =>
        Interval.fromDateTimes(booking.start_at, booking.end_at)
      )

      const allBusyIntervals = [...busyBookingInterval, ...busyGoogleIntervals]

      // 4. Génération des slots
      const availableSlots = []
      let cursor = dayStart

      while (cursor.plus({ minutes: serviceDuration }) <= dayEnd) {
        const slotInterval = Interval.after(cursor, { minutes: serviceDuration })
        const blockingEvent = allBusyIntervals.find((busy: Interval) => busy.overlaps(slotInterval))

        if (!blockingEvent) {
          availableSlots.push({
            start: cursor.toISO(),
            end: cursor.plus({ minutes: serviceDuration }).toISO(),
          })
        }
        cursor = cursor.plus({ minutes: serviceDuration })
      }

      results.push({
        date: currentDay.toISODate(),
        availableSlots,
      })
    }
    return { ok: true, data: results }
  }
}
