/** A JSON object returned by the API, always carrying a string `id`. */
export type RawDocument = Record<string, unknown> & { id: string }
