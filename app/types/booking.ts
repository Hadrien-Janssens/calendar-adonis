import Booking from '#models/booking'
import { DateTime } from 'luxon'

export type BookingResult = {
  booking: Booking
  stripeClientSecret: string | null
}

export type SlotType = {
  start: DateTime
  end: DateTime
}
export type BookingType = {
  email: string
  slot: SlotType
  isWithPayement: boolean
  serviceId: number
}
