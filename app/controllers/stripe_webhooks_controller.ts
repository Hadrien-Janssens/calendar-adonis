import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import Stripe from 'stripe'
import { inject } from '@adonisjs/core'
import { StripeService } from '#services/stripe_service'

@inject()
export default class StripeWebhooksController {
  constructor(protected stripeService: StripeService) {}

  public async handleStripeWebhook({ request, response }: HttpContext) {
    console.log('call handleStripeWebhook')
    const signature = request.header('stripe-signature')
    const rawBody = request.raw()
    let event

    if (!signature) {
      logger.warn({ ip: request.ip() }, 'Tentative de webhook sans signature')
      return response.badRequest('Missing signature')
    }

    if (!rawBody) {
      logger.warn('Webhook reçu avec un corps vide')
      return response.badRequest('Missing body')
    }

    try {
      event = this.stripeService.constructEvent(rawBody, signature)
    } catch (err) {
      console.log(`⚠️ Webhook signature verification failed.`, err.message)
      return response.badRequest('Webhook Error: Signature verification failed')
    }

    // Handle the event
    const paymentIntent = event.data.object as Stripe.PaymentIntent

    switch (event.type) {
      case 'payment_intent.succeeded':
        this.stripeService.handlePaymentIntentSucceeded(paymentIntent)
        break
      case 'payment_method.attached':
        // Then define and call a method to handle the successful attachment of a PaymentMethod.
        // handlePaymentMethodAttached(paymentMethod);
        break
      case 'payment_intent.payment_failed':
        this.stripeService.handlePaymentIntentFailed(paymentIntent)
        break
      default:
        logger.warn(`Unhandled event type ${event.type}`)
    }

    // Return a response to acknowledge receipt of the event
    response.send({ received: true })
  }
}
