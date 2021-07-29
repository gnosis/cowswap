import { ChainId } from '@uniswap/sdk'
import { WETH9 } from '@uniswap/sdk-core'
import { DAI_RINKEBY, USDC_RINKEBY, USDT_RINKEBY, WBTC_RINKEBY } from '@src/custom/utils/rinkeby/constants'
import { getTokenLogoURL } from 'components/CurrencyLogo'
import { DAI, USDC, USDT, WBTC } from 'constants/tokens'
import { USDC_XDAI, USDT_XDAI, WBTC_XDAI, WXDAI } from 'utils/xdai/constants'

export * from './tokensMod'

export const ADDRESS_IMAGE_OVERRIDE = {
  // Rinkeby
  [DAI_RINKEBY.address]: getTokenLogoURL(DAI.address),
  [USDC_RINKEBY.address]: getTokenLogoURL(USDC.address),
  [USDT_RINKEBY.address]: getTokenLogoURL(USDT.address),
  [WBTC_RINKEBY.address]: getTokenLogoURL(WBTC.address),
  [WETH9[ChainId.RINKEBY].address]: getTokenLogoURL(WETH9[ChainId.MAINNET].address),

  // xDai
  [USDC_XDAI.address]: getTokenLogoURL(USDC.address),
  [USDT_XDAI.address]: getTokenLogoURL(USDT.address),
  [WBTC_XDAI.address]: getTokenLogoURL(WBTC.address),
  [WXDAI.address]:
    'https://raw.githubusercontent.com/1Hive/default-token-list/master/src/assets/xdai/0xe91d153e0b41518a2ce8dd3d7944fa863463a97d/logo.png',
}
