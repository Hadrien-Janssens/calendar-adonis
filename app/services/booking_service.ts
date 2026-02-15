import Booking from '#models/booking'
import { inject } from '@adonisjs/core'
import { StripeService } from './stripe_service.js'
import SlotUnavailableException from '#exceptions/slot_unavailable_exception'
import { BookingResult, BookingType, SlotType } from '../types/booking.js'
import Service from '#models/service'
import { DateTime } from 'luxon'

@inject()
export class BookingService {
  constructor(protected stripeService: StripeService) {}

  private async createBooking(bookingDTO: BookingType): Promise<Booking> {
    const service = await Service.findOrFail(bookingDTO.serviceId)

    const booking = await Booking.create({
      status: bookingDTO.isWithPayement ? 'pending_payement' : 'confirmed_unpaid',
      email: bookingDTO.email,
      start_at: bookingDTO.slot.start,
      end_at: bookingDTO.slot.end,
      priceCents: service.priceCents,
      expires_at: bookingDTO.isWithPayement ? DateTime.now().toUTC().plus({ minutes: 15 }) : null,
    })

    return booking
  }

  // TODO: faire une transaction au cas ou deux utilisateurs reserve à la même milliseconde.
  private async isSlotAvailable(slot: SlotType): Promise<boolean> {
    const existingSlot = await Booking.query()
      .where('start_at', '<', slot.end.toJSDate())
      .andWhere('end_at', '>', slot.start.toJSDate())
      .first()

    return !existingSlot
  }

  public async booking(bookingDTO: BookingType): Promise<BookingResult> {
    // Slot Checking
    const isSlotAvailable = await this.isSlotAvailable(bookingDTO.slot)
    if (!isSlotAvailable) {
      throw new SlotUnavailableException()
    }
    // CREATE BOOKING IN DATABASE
    const booking = await this.createBooking(bookingDTO)
    // TODO: ajouter dans googlecalendar: dans le GoogleService (avoir si je dois le faire avant ou après le payement ?)

    // CHECK PAYEMENT
    if (bookingDTO.isWithPayement) {
      const stripeResponse = await this.stripeService.createIntent(booking)
      const { client_secret: clientSecret } = stripeResponse

      return { booking: booking, stripeClientSecret: clientSecret }
    } else {
      return { booking: booking, stripeClientSecret: null }
    }
  }
}
