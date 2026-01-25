import OpeningHour from '#models/opening_hour'
import Service from '#models/service'
import { inject } from '@adonisjs/core'
import { GoogleCalendarService } from './google_calendar_service.js'

@inject()
export class AvailabilitySlotService {
  constructor(protected googleService: GoogleCalendarService) {}

  public async getMonthAvailability(month: string, serviceId: number) {
    // 1. récupérer le service (durée)
    const service = await Service.findOrFail(serviceId)

    // 2. récupérer les horaires d'ouverture
    const openingHours = await OpeningHour.all()

    // 3. récupérer les events Google
    const events = await this.googleService.listEvents()
    // 4. calculer les slots par jour - utiliser luxon
    // 5. retourner { date, slotsCount }
  }
}
