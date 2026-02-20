import { AvailabilitySlotService } from '#services/availability_slot_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class AvailibilitySlotsController {
  constructor(protected availabilitySlotService: AvailabilitySlotService) {}
  /**
   * Give all availables slots by day for the giving month
   * @returns
   */
  async availableSlot({ request, response }: HttpContext) {
    // TODO: faire un validator pour les inputs reçus ici
    const date = request.input('date')
    const serviceId = request.input('service_id')
    const result = await this.availabilitySlotService.getMonthAvailability(date, serviceId)

    if (!result.ok) {
      if (result.error === 'INVALID_FORMAT') {
        return response.badRequest({
          message: 'Invalid month format. Expected yyyy-MM',
        })
      }

      if (result.error === 'PAST_MONTH') {
        return response.unprocessableEntity({
          message: "Can't provide previous month.",
        })
      }
      return response.json({
        message: "Error doesn't catch : no details",
      })
    } else {
      return result.data
    }
  }
}
