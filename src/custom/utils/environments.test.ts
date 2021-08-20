import { checkEnvironment, EnvironmentChecks } from './environments'

const DEFAULT_ENVIRONMENTS_CHECKS: EnvironmentChecks = {
  isProd: false,
  isEns: false,
  isBarn: false,
  isStaging: false,
  isPr: false,
  isDev: false,
  isLocal: false,
}

describe('Detect environments using host and path', () => {
  describe('Not a known environment', () => {
    it('Empty strings', () => {
      expect(checkEnvironment('', '')).toEqual(DEFAULT_ENVIRONMENTS_CHECKS)
    })
    it('Unknown domain', () => {
      expect(checkEnvironment('github.com', '')).toEqual(DEFAULT_ENVIRONMENTS_CHECKS)
    })
  })

  describe('Is production', () => {
    const isProduction = { ...DEFAULT_ENVIRONMENTS_CHECKS, isProd: true }

    it('cowswap.exchange', () => {
      expect(checkEnvironment('cowswap.exchange', '')).toEqual(isProduction)
    })

    it('CowSwap.exchange', () => {
      expect(checkEnvironment('CowSwap.exchange', '')).toEqual(isProduction)
    })
  })

  describe('Is ENS', () => {
    const isEns = { ...DEFAULT_ENVIRONMENTS_CHECKS, isEns: true }

    it('cowswap.eth', () => {
      expect(checkEnvironment('cowswap.eth', '')).toEqual(isEns)
    })

    it('cowswap.eth.link', () => {
      expect(checkEnvironment('cowswap.eth.link', '')).toEqual(isEns)
    })

    it('<CID>.ipfs.dweb.link', () => {
      expect(
        checkEnvironment('bafybeiff3lt2cfhrxvv3tm77s5qvaoaksxfrrblcclnvkxbf56oxqapjuq.ipfs.dweb.link', '')
      ).toEqual(isEns)
    })

    it('cloudflare-ipfs.com/ipfs/<HASH>', () => {
      expect(checkEnvironment('cloudflare-ipfs.com', '/ipfs/somehash')).toEqual(isEns)
    })

    it('gateway.pinata.cloud/ipfs/<HASH>', () => {
      expect(checkEnvironment('gateway.pinata.cloud', '/ipfs/QmZW5abzempvhyPvSMbLhnmZ6d6SEGgGQd3paaHRK7CSfm')).toEqual(
        isEns
      )
    })
  })

  describe('Is Barn', () => {
    const isBarn = { ...DEFAULT_ENVIRONMENTS_CHECKS, isBarn: true }

    it('barn.cowswap.exchange', () => {
      expect(checkEnvironment('barn.cowswap.exchange', '')).toEqual(isBarn)
    })
  })

  describe('Is Staging', () => {
    const isStaging = { ...DEFAULT_ENVIRONMENTS_CHECKS, isStaging: true }

    it('cowswap.staging.gnosisdev.com', () => {
      expect(checkEnvironment('cowswap.staging.gnosisdev.com', '')).toEqual(isStaging)
    })
  })

  describe('Is PR', () => {
    const isPr = { ...DEFAULT_ENVIRONMENTS_CHECKS, isPr: true }

    it('pr<NUMBER>--gpswapui.review.gnosisdev.com', () => {
      expect(checkEnvironment('pr1291--gpswapui.review.gnosisdev.com', '')).toEqual(isPr)
    })
  })

  describe('Is Development', () => {
    const isDevelopment = { ...DEFAULT_ENVIRONMENTS_CHECKS, isDev: true }

    it('cowswap.dev.gnosisdev.com', () => {
      expect(checkEnvironment('cowswap.dev.gnosisdev.com', '')).toEqual(isDevelopment)
    })
  })

  describe('Is Local', () => {
    const isLocal = { ...DEFAULT_ENVIRONMENTS_CHECKS, isLocal: true }

    it('localhost:3000', () => {
      expect(checkEnvironment('localhost:3000', '')).toEqual(isLocal)
    })

    it('localhost:8080', () => {
      expect(checkEnvironment('localhost:8080', '')).toEqual(isLocal)
    })

    it('127.0.0.1:3000', () => {
      expect(checkEnvironment('127.0.0.1:3000', '')).toEqual(isLocal)
    })

    it('192.168.0.11:3000', () => {
      expect(checkEnvironment('192.168.0.11:3000', '')).toEqual(isLocal)
    })
  })
})

// import deterministicHash from './deterministicHash'

// describe('deterministicHash', () => {
//   it('correctly generates the sha256 of an object', () => {
//     const doc = {
//       version: '1.0.0',
//       appCode: 'CowSwap',
//       metadata: {
//         referrer: {
//           kind: 'referrer',
//           referrer: '0x1811be0994930fE9480eAEDe25165608B093ad7A',
//           version: '1.0.0',
//         },
//       },
//     }

//     expect(deterministicHash(doc)).toBe('0xd5f44c18e6cc2e16023dcd145710208339bb26f6c52df20d1c2f49f3f31c7014')
//   })
//   it('always generates the same sha256 of an object no matter the order of the properties', () => {
//     const doc1 = {
//       version: '1.0.0',
//       appCode: 'CowSwap',
//       metadata: {
//         referrer: {
//           kind: 'referrer',
//           referrer: '0x1811be0994930fE9480eAEDe25165608B093ad7A',
//           version: '1.0.0',
//         },
//       },
//     }
//     const doc2 = {
//       appCode: 'CowSwap',
//       version: '1.0.0',
//       metadata: {
//         referrer: {
//           version: '1.0.0',
//           kind: 'referrer',
//           referrer: '0x1811be0994930fE9480eAEDe25165608B093ad7A',
//         },
//       },
//     }

//     expect(deterministicHash(doc1)).toBe(deterministicHash(doc2))
//   })
// })
