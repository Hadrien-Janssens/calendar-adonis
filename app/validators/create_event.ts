import vine from '@vinejs/vine'

export const createEventValidator = vine.compile(
  vine.object({
    title: vine.string().trim(),
    start: vine.date({ formats: ['iso8601'] }),
    end: vine.date({ formats: ['iso8601'] }),
  })
)
