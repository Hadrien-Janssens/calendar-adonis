import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { BookingService } from '#services/booking_service'

@inject()
export default class BookingsController {
  constructor(protected bookingService: BookingService) {}
  async booking({ request, response }: HttpContext) {
    // verifier les data DTO ? VALIDATOR ?
    this.bookingService.booking(validateDataRequest)
  }
}
