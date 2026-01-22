import Service from '#models/service'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method
    await Service.create({
      name: 'Coupe homme',
      description: 'Coupe classique',
      priceCents: 2500,
      durationMinutes: 30,
    })
  }
}
