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

router.get('/', async () => {
  return {
    hello: 'world',
  }
})
router.post('events', [GoogleCalendarController, 'createEvent'])
router.get('events', [GoogleCalendarController, 'listEvents'])
