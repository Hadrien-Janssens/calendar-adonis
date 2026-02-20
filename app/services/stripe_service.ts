import BookingConfirmationNotification from '#mails/booking_confirmation_notification'
import Booking from '#models/booking'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'
import mail from '@adonisjs/mail/services/main'
import Stripe from 'stripe'
import { GoogleCalendarService } from './google_calendar_service.js'
import Service from '#models/service'
import { inject } from '@adonisjs/core'

@inject()
export class StripeService {
  public stripe: Stripe

  constructor(private googleService: GoogleCalendarService) {
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
    logger.info({ paymentIntent }, 'payement intent handlePaymentIntentSucceeded :')
    const bookingId = paymentIntent.metadata.reservationId
    const booking = await Booking.findOrFail(bookingId)
    logger.info({ booking: booking })
    const service = await Service.findOrFail(booking.serviceId)
    const clientEmail = booking.email

    // 1. modifier le status de la reservation à "confirmed_paid"
    // TODO: utiliser le booking service pour la confirmed_paid
    booking.status = 'confirmed_paid'
    await booking.save()
    // 2. envoyer un mail de confirmation
    // await mail.send(new BookingConfirmationNotification(clientEmail))
    // 3. Mettre le rendez-vous sur google agenda ( utiliser le google service)
    this.googleService.createEvent({
      title: service.name,
      start: booking.start_at.toJSDate(),
      end: booking.end_at.toJSDate(),
    })
  }

  public async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
    const errorMessage = paymentIntent.last_payment_error?.message
    logger.warn({ id: paymentIntent.id, error: errorMessage }, 'Paiement échoué')
    // Action : Envoyer un mail au client pour lui dire de changer de carte
  }
}
