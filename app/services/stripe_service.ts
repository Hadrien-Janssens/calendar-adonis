import Booking from '#models/booking'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'
import Stripe from 'stripe'

export class StripeService {
  public stripe: Stripe

  constructor() {
    this.stripe = new Stripe(env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2026-01-28.clover',
    })
  }

  public constructEvent(rawBody: string, signature: string) {
    const webhookSecret = env.get('STRIPE_WEBHOOK_SECRET')
    if (!webhookSecret) {
      logger.error("Missing 'STRIPE_WEBHOOK_SECRET' in .env")
      throw new Error('Error server configuration')
    }
    return this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  }
  public async createIntent(booking: Booking) {
    // Set your secret key. Remember to switch to your live secret key in production.
    // See your keys here: https://dashboard.stripe.com/apikeys

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: booking.priceCents,
      currency: 'eur',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        reservationId: booking.id,
      },
    })
    return paymentIntent
  }

  public async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    // 1. envoyer un mail de confirmation
    // TODO: essaye de logguer le paymentIntent pour voir si tu as l'id de la reservation. ensuite recuperer la resevation pour avori l'email et envoei un mail a l'utilisateur
    logger.info('payement intent dans mon handlePaymentIntentSucceeded :' + paymentIntent)
    // 2. modifier le status de la reservation à "confirmed_paid"
    // 3.
  }

  public async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
    const errorMessage = paymentIntent.last_payment_error?.message
    logger.warn({ id: paymentIntent.id, error: errorMessage }, 'Paiement échoué')
    // Action : Envoyer un mail au client pour lui dire de changer de carte
  }
}
