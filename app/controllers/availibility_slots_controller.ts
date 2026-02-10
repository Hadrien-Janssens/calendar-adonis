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
    const month = request.input('month')
    const serviceId = request.input('service_id')
    const result = await this.availabilitySlotService.getMonthAvailability(month, serviceId)
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
    } else {
      return result.data
    }
  }
}
