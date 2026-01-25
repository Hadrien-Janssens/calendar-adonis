import axios from 'axios'
import { AuthorizationCode } from 'simple-oauth2'

export class GoogleCalendarService {
  private client = new AuthorizationCode({
    client: {
      id: process.env.GOOGLE_CLIENT_ID!,
      secret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    auth: {
      tokenHost: 'https://oauth2.googleapis.com',
      tokenPath: '/token',
    },
  })

  private async getAccessToken(): Promise<string> {
    const tokenObject = this.client.createToken({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
    })
    const accessToken = await tokenObject.refresh()
    return accessToken.token.access_token as string
  }

  public async listEvents() {
    const accessToken = await this.getAccessToken()
    const twoYearsLater = new Date()
    twoYearsLater.setFullYear(twoYearsLater.getFullYear() + 2)
    const timeMax = twoYearsLater.toISOString()
    const res = await axios.get(
      'https://www.googleapis.com/calendar/v3/calendars/610364e5fc6cdc9d379217f5f168b5a5943e9b6d4e2039cae85fbd6ee3e22dba@group.calendar.google.com/events',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          timeMin: '2026-01-01T00:00:00Z',
          timeMax: timeMax,
          orderBy: 'startTime',
          singleEvents: true,
          maxResults: 2500,
        },
      }
    )
    return res.data.items
  }

  public async createEvent(data: { title: string; start: Date; end: Date }) {
    const { title, start, end } = data

    const accessToken = await this.getAccessToken()

    const res = await axios.post(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        summary: title,
        start: { dateTime: start },
        end: { dateTime: end },
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )
    return res.data
  }
}
