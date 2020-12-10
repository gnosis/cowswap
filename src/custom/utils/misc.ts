export const isTruthy = <T>(value: T | null | undefined | false): value is T => !!value

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
