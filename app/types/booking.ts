import { DateTime } from 'luxon'

export type StripeClientSecret = string

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
