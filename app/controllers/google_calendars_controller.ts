import type { HttpContext } from '@adonisjs/core/http'
import { GoogleCalendarService } from '#services/google_calendar_service'
import { createEventValidator } from '#validators/create_event'
import { Exception } from '@adonisjs/core/exceptions'

export default class GoogleCalendarController {
  public async listEvents({ response }: HttpContext) {
    const service = new GoogleCalendarService()
    const events = await service.listEvents()

    return response.json(events)
  }

  public async createEvent({ request, response }: HttpContext) {
    //validate data
    const payload = await request.validateUsing(createEventValidator)

    //check date make sens
    // TODO: faire une regle custome vineJS ...
    if (payload.start > payload.end) {
      throw new Exception('The event start date must be before the event end date', {
        status: 422,
      })
    }
    const service = new GoogleCalendarService()
    const res = await service.createEvent(payload)

    return response.status(201).json(res)
  }
}
