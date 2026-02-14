import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export const BOOKING_STATUSES = [
  'pending',
  'pending_payement',
  'confirmed_unpaid',
  'confirmed_paid',
  'cancelled',
  'expired',
  'refunded',
] as const

export type BookingStatus = (typeof BOOKING_STATUSES)[number]

export default class Booking extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare email: string

  @column.dateTime()
  declare start_at: DateTime

  @column.dateTime()
  declare end_at: DateTime

  @column()
  declare priceCents: number

  @column()
  declare status: BookingStatus

  @column()
  declare expires_at: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
