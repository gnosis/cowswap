import { isProd, isEns, isBarn, isCi } from 'utils/environments'

export const IS_CLAIMING_ENABLED = !isProd && !isEns && !isBarn && !isCi
export const IS_TESTING_ENV = !isProd && !isEns && !isBarn
