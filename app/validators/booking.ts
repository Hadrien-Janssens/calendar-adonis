import vine from '@vinejs/vine'
import { DateTime } from 'luxon'

export const bookingValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    slot: vine.object({
      start: vine
        .date({ formats: ['iso8601'] })
        .transform((value) => DateTime.fromJSDate(value).toUTC()),
      end: vine
        .date({ formats: ['iso8601'] })
        .afterField('start', { compare: 'second' })
        .transform((value) => DateTime.fromJSDate(value).toUTC()),
    }),
    serviceId: vine.number(),
    isWithPayement: vine.boolean(),
  })
)
