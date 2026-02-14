import Booking from '#models/booking'
import { inject } from '@adonisjs/core'
import { StripeService } from './stripe_service.js'
import SlotUnavailableException from '#exceptions/slot_unavailable_exception'
import { BookingType, SlotType, StripeClientSecret } from '../types/booking.js'
import Service from '#models/service'

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
      // expires_at: new Date(Date.now() + 15 * 60 * 1000),
      expires_at: null,
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

  public async booking(bookingDTO: BookingType): Promise<Booking | StripeClientSecret> {
    // 1. vérifier si le slot est disponible
    const isSlotAvailable = await this.isSlotAvailable(bookingDTO.slot)
    // 2. si pas disponible
    if (!isSlotAvailable) {
      throw new SlotUnavailableException()
    }

    const booking = await this.createBooking(bookingDTO)
    // TODO: ajouter dans googlecalendar: dans le GoogleService (avoir si je dois le faire avant ou après le payement ?)

    // 3. vérifier si il faut faire un payement
    if (bookingDTO.isWithPayement) {
      this.stripeService.createIntent(booking)
      //    b. DANS UN STRIPEPAYEMENTSERVICE ?
      //    - faire le payementIntent
      //    - return le {ClientSecret : sdfqsfsfsf}
      return 'Configure later'
    } else {
      return booking
    }
  }
}
