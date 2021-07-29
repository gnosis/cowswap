import { getTokenLogoURL } from 'components/CurrencyLogo'
import { USDC, USDT, WBTC } from 'constants/tokens'
import { USDC_XDAI, USDT_XDAI, WBTC_XDAI, WXDAI } from 'utils/xdai/constants'

export * from './tokensMod'

export const ADDRESS_IMAGE_OVERRIDE = {
  [USDC_XDAI.address]: getTokenLogoURL(USDC.address),
  [USDT_XDAI.address]: getTokenLogoURL(USDT.address),
  [WBTC_XDAI.address]: getTokenLogoURL(WBTC.address),
  [WXDAI.address]:
    'https://raw.githubusercontent.com/1Hive/default-token-list/master/src/assets/xdai/0xe91d153e0b41518a2ce8dd3d7944fa863463a97d/logo.png',
}
