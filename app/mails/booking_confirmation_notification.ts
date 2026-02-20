import { BaseMail } from '@adonisjs/mail'

export default class BookingConfirmationNotification extends BaseMail {
  constructor(private email: string) {
    super()
  }

  from = 'Ton App <noreply@hadrien-janssens.com>'
  subject = 'Confirmation de la réservation'

  /**
   * The "prepare" method is called automatically when
   * the email is sent or queued.
   */

  prepare() {
    // TODO: tu peux faire la méthode HTMLView ( meilleur organisation )
    this.message
      .to(this.email)
      .replyTo('hadrien.janssens7@gmail.com')
      .html(`<p>Voici la confirmation</p>`)
  }
}
