export const isTruthy = <T>(value: T | null | undefined | false): value is T => !!value

export const delay = <T = void>(ms = 100, result?: T): Promise<T> =>
  new Promise(resolve => setTimeout(resolve, ms, result))

export const registerOnWindow = (registerMapping: Record<string, any>) => {
  Object.entries(registerMapping).forEach(([key, value]) => {
    ;(window as any)[key] = value
  })
}
export function extendObject<T extends {}>(objectToExtend: T | null, extendedProperties = {}) {
  if (!objectToExtend) return null

  return Object.assign(objectToExtend, Object.create(objectToExtend), {
    ...extendedProperties
  })
}

export function proxify<T extends {}>(target: T | null, handler: ProxyHandler<T>) {
  if (!target) return null

  return new Proxy<T>(target, handler)
}
