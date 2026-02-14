/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
const GoogleCalendarController = () => import('#controllers/google_calendars_controller')
const ServicesController = () => import('#controllers/services_controller')
const AvailibilitySlotsController = () => import('#controllers/availibility_slots_controller')
const BookingsController = () => import('#controllers/bookings_controller')

// GOOGLE EVENT ROUTE : I think don't need for a long time again
router.post('events', [GoogleCalendarController, 'createEvent'])
router.get('events', [GoogleCalendarController, 'listEvents'])

// SERVICE ROUTE
router.get('services', [ServicesController, 'index'])

router.get('/slots', [AvailibilitySlotsController, 'availableSlot'])

router.post('/booking', [BookingsController, 'store'])
