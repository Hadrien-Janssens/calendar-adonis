import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { BookingService } from '#services/booking_service'
import { bookingValidator } from '#validators/booking'
import { BookingType } from '../types/booking.js'

@inject()
export default class BookingsController {
  constructor(protected bookingService: BookingService) {}

  public async store({ request, response }: HttpContext) {
    const bookingDTO: BookingType = await request.validateUsing(bookingValidator)
    const res = await this.bookingService.booking(bookingDTO)
    return response.json(res)
  }
}
