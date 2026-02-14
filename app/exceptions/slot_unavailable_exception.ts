import { Exception } from '@adonisjs/core/exceptions'

export default class SlotUnavailableException extends Exception {
  static status = 409
  static code = 'E_SLOT_UNAVAILABLE'
  static message = 'Slot is not available'
}
