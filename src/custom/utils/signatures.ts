import { domain as domainGp, signOrder as signOrderGp, Order, Signature } from '@gnosis.pm/gp-v2-contracts'
import { ChainId } from '@uniswap/sdk'

import { GP_SETTLEMENT_CONTRACT_ADDRESS } from 'constants/index'
import { TypedDataDomain, Signer } from 'ethers'
import { registerOnWindow } from './misc'

export { OrderKind } from '@gnosis.pm/gp-v2-contracts'
export type UnsignedOrder = Omit<Order, 'receiver'> & { receiver: string }

export interface SignOrderParams {
  chainId: ChainId
  signer: Signer
  order: UnsignedOrder
  signingScheme: EcdsaSigningScheme
}

// posted to /api/v1/orders on Order creation
// serializable, so no BigNumbers
//  See https://protocol-rinkeby.dev.gnosisdev.com/api/
export interface OrderCreation extends UnsignedOrder {
  // TODO: I commented this because I expect the API and contract to follow the same structure for the order data. confirm and delete this comment
  signature: string // 65 bytes encoded as hex without `0x` prefix. v + r + s from the spec
  signedScheme: SigningScheme
}

// TODO: We cannot make use of the NPM exported enum for now. See https://babeljs.io/docs/en/babel-plugin-transform-typescript#caveats
// After https://github.com/gnosis/gp-v2-contracts/pull/568/files is published, we can use it and we should remove our own definition
export enum SigningScheme {
  /**
   * The EIP-712 typed data signing scheme. This is the preferred scheme as it
   * provides more infomation to wallets performing the signature on the data
   * being signed.
   *
   * <https://github.com/ethereum/EIPs/blob/master/EIPS/eip-712.md#definition-of-domainseparator>
   */
  EIP712,
  /**
   * Message signed using eth_sign RPC call.
   */
  ETHSIGN,
  /**
   * Smart contract signatures as defined in EIP-1271.
   *
   * <https://eips.ethereum.org/EIPS/eip-1271>
   */
  EIP1271,
  /**
   * Pre-signed order.
   */
  PRESIGN
}
export type EcdsaSigningScheme = SigningScheme.EIP712 | SigningScheme.ETHSIGN

function _getDomain(chainId: ChainId): TypedDataDomain {
  // Get settlement contract address
  const settlementContract = GP_SETTLEMENT_CONTRACT_ADDRESS[chainId]

  if (!settlementContract) {
    throw new Error('Unsupported network. Settlement contract is not deployed')
  }

  return domainGp(chainId, settlementContract) // TODO: Fix types in NPM package
}

// TODO: This method will dissapear once we use the NPM exported enum. See comments above in SigningScheme enum
function _getSigningSchemeValue(ecdaSigningScheme: EcdsaSigningScheme) {
  switch (ecdaSigningScheme) {
    case SigningScheme.EIP712:
      return 0
    case SigningScheme.ETHSIGN:
      return 1
  }
}

export async function signOrder(params: SignOrderParams): Promise<Signature> {
  const { chainId, signer, order, signingScheme } = params

  const domain = _getDomain(chainId)
  console.log('[utils:signature] signOrder', {
    domain,
    order,
    signer
  })
  return signOrderGp(domain, order, signer, _getSigningSchemeValue(signingScheme))
}

registerOnWindow({ signature: { signOrder, getDomain: _getDomain } })
