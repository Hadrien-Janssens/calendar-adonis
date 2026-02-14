import { BOOKING_STATUSES } from '#models/booking'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'bookings'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('email').notNullable()
      table.dateTime('start_at').notNullable()
      table.dateTime('end_at').notNullable()
      table.integer('price_cents').notNullable()
      table.enum('status', BOOKING_STATUSES).notNullable().defaultTo('pending')
      table.date('expires_at').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
