export * from '@src/utils/prices'

const DEFAULT_TIP = '5'

// TODO: add mock API using Alex's created open API definition of tip endpoint
export const getTip = (): string | undefined => {
  // TODO: replace with fetch call to OBA-API TIP endpoint
  const fakeTip: string | undefined = !!(Math.random() % 3) ? DEFAULT_TIP : undefined

  return fakeTip
}
