import OpeningHour from '#models/opening_hour'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method
    await OpeningHour.createMany([
      {
        weekday: 1,
        opens_at: '10:30:00',
        closes_at: '19:30:00',
      },
      {
        weekday: 2,
        opens_at: '09:00:00',
        closes_at: '18:00:00',
      },
      {
        weekday: 3,
        opens_at: '08:00:00',
        closes_at: '12:30:00',
      },
      {
        weekday: 5,
        opens_at: '09:00:00',
        closes_at: '18:00:00',
      },
      {
        weekday: 6,
        opens_at: '13:00:00',
        closes_at: '18:00:00',
      },
    ])
  }
}
