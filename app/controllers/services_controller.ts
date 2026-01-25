import type { HttpContext } from '@adonisjs/core/http'

import Service from '#models/service'

export default class ServicesController {
  public async index({ response }: HttpContext) {
    const services = await Service.all()
    return response.json(services)
  }
}
