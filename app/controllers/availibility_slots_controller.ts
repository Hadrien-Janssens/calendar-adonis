import { AvailabilitySlotService } from '#services/availability_slot_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class AvailibilitySlotsController {
  /**
   * Give a count of availables slot by day for the giving month
   * @returns
   */
  async slotCountByDay({ request }: HttpContext) {
    const month = request.input('month')
    const serviceId = request.input('service_id')

    return AvailabilitySlotService.getMonthAvailability(month, serviceId)
  }

  /**
   * Give availables slots for giving day
   * @returns
   */
  async availableSlot() {
    return
  }
}
