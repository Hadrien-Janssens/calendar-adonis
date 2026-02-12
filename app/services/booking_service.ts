import { inject } from '@adonisjs/core'

@inject()
export class BookingService {
  constructor(protected stripeService: StripService) {}

  private isSlotAvailable(slot): boolean {
    //logique pour vérifier si le crénaux est diponible
  }
  private createBooking(isWithPayement): number | Error {
    //    # créer la reservation en DB :
    //    - statut : confirmed_unpaid || pending_payement
    //    - email invité
    //    - créneau
    //    - prix calculé côté backend
    //.   - expires_at : null || now()+15 min
    //
    //    return  l'id ex: 123
  }

  // je peux peut etre faire du destructuring pour recuperer "validateDataRequest"
  public booking(validateDataRequest) {
    // 1. vérifier si le slot est disponible
    const isSlotAvailable = this.isSlotAvailable(validateDataRequest.slot)
    // 2. si pas disponible return "slot pas disponible"
    if (!isSlotAvailable) {
      return 'INVALID_SLOT'
    }
    const bookingId = this.createBooking(validateDataRequest.isWithPayement)
    // 3. vérifier si il faut faire un payement
    if (validateDataRequest.isWithPayement) {
      this.stripeService.payementIntent(bookingId)
      //    b. DANS UN STRIPEPAYEMENTSERVICE ?
      //    - faire le payementIntent
      //    - return le ClientSecret
    }
  }
}
