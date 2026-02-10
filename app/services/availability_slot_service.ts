import OpeningHour from '#models/opening_hour'
import Service from '#models/service'
import { inject } from '@adonisjs/core'
import { GoogleCalendarService } from './google_calendar_service.js'
import { DateTime, Interval } from 'luxon'

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
  constructor(protected googleService: GoogleCalendarService) {}

  public async getMonthAvailability(
    month: string,
    serviceId: number
  ): Promise<MonthAvailabilityResult> {
    const ZONE = 'Europe/Brussels' // On fixe la zone pour tout le calcul
    const service = await Service.findOrFail(serviceId)
    const serviceDuration = service.durationMinutes
    const openingHours = await OpeningHour.all()
    const events = await this.googleService.listEvents()

    // 3. récupérer les events Google TODO: recupérer que ceux du mois ;)
    //     const events = await this.googleService.listEvents()
    // 4. calculer les slots disponible par jour pour tout le mois donné- utiliser luxon
    // TODO: vérifier que le mois est correct, mais pas le vérifier dans le service, le verifier dans le controleur via un validateur par exemple

    // 1. Parser le mois en forçant la zone
    // Si month = "2026-01", Luxon risque d'être "Invalid", assure-toi de recevoir "2026-01-01"

    const currentDate = DateTime.fromISO(month, { zone: ZONE })
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
      today = DateTime.now().day - 1 // -1 because 1-31
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

      // 3. Filtrer et convertir les événements
      const busyIntervals = events
        .filter((e) => e.transparency !== 'transparent') // On ignore les événements "disponibles"
        .map((e) => {
          if (e.start.dateTime) {
            return Interval.fromDateTimes(
              DateTime.fromISO(e.start.dateTime, { setZone: true }),
              DateTime.fromISO(e.end.dateTime, { setZone: true })
            )
          } else {
            // Événement all-day : Google donne le lendemain comme date de fin (exclusive)
            return Interval.fromDateTimes(
              DateTime.fromISO(e.start.date, { zone: ZONE }).startOf('day'),
              DateTime.fromISO(e.end.date, { zone: ZONE }).startOf('day')
            )
          }
        })
        .filter((int) => int.overlaps(dayInterval))

      // 4. Génération des slots
      const availableSlots = []
      let cursor = dayStart

      while (cursor.plus({ minutes: serviceDuration }) <= dayEnd) {
        const slotInterval = Interval.after(cursor, { minutes: serviceDuration })
        const blockingEvent = busyIntervals.find((busy) => busy.overlaps(slotInterval))

        if (!blockingEvent) {
          availableSlots.push({
            start: cursor.toISO(),
            end: cursor.plus({ minutes: serviceDuration }).toISO(),
          })
          // cursor = cursor.plus({ minutes: serviceDuration })
        }
        cursor = cursor.plus({ minutes: serviceDuration })

        //  else {
        //   // On saute à la fin de l'événement bloquant
        //   cursor = blockingEvent.end
        // }
      }

      results.push({
        date: currentDay.toISODate(),
        availableSlots,
      })
    }
    return { ok: true, data: results }
  }
}
