import Service from '#models/service'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method
    await Service.createMany([
      {
        name: 'Coupe homme',
        description: 'Coupe classique',
        priceCents: 2500,
        durationMinutes: 30,
      },
      {
        name: 'Vernis permanent',
        priceCents: 3500,
        durationMinutes: 120,
      },
      {
        name: 'Contour sourcil',
        priceCents: 1500,
        durationMinutes: 50,
      },
      {
        name: 'Pose cils',
        priceCents: 4000,
        durationMinutes: 100,
      },
    ])
  }
}
