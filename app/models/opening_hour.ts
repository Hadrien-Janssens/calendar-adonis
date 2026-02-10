import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class OpeningHour extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare weekday: number

  @column()
  declare opens_at: string

  @column()
  declare closes_at: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
