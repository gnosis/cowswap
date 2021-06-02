import React, { useCallback, useContext, useEffect, useState } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import styled, { ThemeContext } from 'styled-components'
import { CurrencyAmount, Token } from '@uniswap/sdk'
import { Text } from 'rebass'

import { ButtonSize, TYPE } from 'theme/index'

import SwapMod from './SwapMod'
import { AutoRow, RowBetween, RowFixed } from 'components/Row'
import {
  BottomGrouping as BottomGroupingUni,
  Wrapper as WrapperUni,
  ArrowWrapper as ArrowWrapperUni,
  Dots
} from 'components/swap/styleds'
import { AutoColumn } from 'components/Column'
import { ClickableText } from 'pages/Pool/styleds'
import { InputContainer } from 'components/AddressInputPanel'
import { GreyCard } from 'components/Card'
import { StyledBalanceMaxMini } from 'components/swap/styleds'
import Card from 'components/Card'
import QuestionHelper from 'components/QuestionHelper'
import { ButtonError, ButtonPrimary } from 'components/Button'
import EthWethWrap, { Props as EthWethWrapProps } from 'components/swap/EthWethWrap'
import { useReplaceSwapState, useSwapState } from 'state/swap/hooks'

import loadingCow from 'assets/cow-swap/cow-load.gif'

interface FeeGreaterMessageProp {
  fee: CurrencyAmount
}

const BottomGrouping = styled(BottomGroupingUni)`
  > div > button {
    align-self: stretch;
  }
`

const SwapModWrapper = styled(SwapMod)`
  ${props => props.className} {
    // For now to target <SwapHeader /> without copying files...
    > div:first-child {
      padding: 0 12px 4px;
      max-width: 100%;
      margin: 0;
    }

    ${WrapperUni} {
      padding: 4px 4px 0;
    }

    ${AutoColumn} {
      grid-row-gap: 3px;
    }

    .expertMode ${AutoColumn} {
      grid-row-gap: 12px;
    }

    ${ClickableText} {
      color: ${({ theme }) => theme.text1};
    }

    ${Card} > ${AutoColumn} {
      margin: 6px auto 0;

        > div > div {
          color: ${({ theme }) => theme.text1};
        }
    }

    ${GreyCard} {
      > div {
        color: ${({ theme }) => theme.text1};
      }
    }

    ${InputContainer} > div > div > div {
      color: ${({ theme }) => theme.text1};
    }

    ${ArrowWrapperUni} {
      position: absolute;
      z-index: 2;
      background: ${({ theme }) => theme.swap.arrowDown.background};
      border-radius: ${({ theme }) => theme.swap.arrowDown.borderRadius};
      width: ${({ theme }) => theme.swap.arrowDown.width};
      height: ${({ theme }) => theme.swap.arrowDown.height};
      display: flex;
      align-items: center;
      justify-content: center;
      border: ${({ theme }) => `${theme.swap.arrowDown.borderSize} solid ${theme.swap.arrowDown.borderColor}`};
      transition: transform 0.1s ease-in-out;

      &:hover {
        opacity: 1;
        transform: translateY(1px);

        > svg {
          stroke: ${({ theme }) => theme.swap.arrowDown.colorHover};
        }
      }

      > svg {
        stroke: ${({ theme }) => theme.swap.arrowDown.color}
      }
    }

    ${StyledBalanceMaxMini} {
      background: ${({ theme }) => theme.bg2};
      color: ${({ theme }) => theme.text2};
    }

    .expertMode ${ArrowWrapperUni} {
      position: relative;
    }

    .expertMode ${AutoRow} {
      padding: 0 1rem;
    }

    ${AutoRow} svg > path {
      stroke: ${({ theme }) => theme.text1};
    }
  }
`

const fadeIn = `
  @keyframes fadeIn {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
`

interface LoadingCowImgProps {
  maxWidth?: string
  showLoader: boolean
}

const LoadingCowImg = styled.img<LoadingCowImgProps>`
  max-width: ${({ maxWidth = '60px' }) => maxWidth};
  opacity: ${({ showLoader }) => (showLoader ? 1 : 0)};

  transition: opacity 0.4s ease-in-out;
`

type LoadingCowProps = {
  isSoftLoading: boolean
} & { maxWidth?: string; src: string }

const LOADING_COW_TIMER = 4000

function LoadingCow(props: LoadingCowProps) {
  const { isSoftLoading, ...rest } = props
  const [showCow, setShowCow] = useState(isSoftLoading)

  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined
    // price is being queried
    if (isSoftLoading) {
      // isn't currently showing cow or hasnt yet been updated here
      // so we clear any running timeouts ready to clear local loading state
      // and essentially reset them
      clearTimeout(timeout as NodeJS.Timeout)
      setShowCow(true)
    } else {
      // no longer loading
      // reset timeout to clear local loading state after LOADING_COW_TIMER ms
      if (showCow) {
        timeout = setTimeout(() => {
          clearTimeout(timeout as NodeJS.Timeout)
          setShowCow(false)
        }, LOADING_COW_TIMER)
      }
    }

    return () => clearTimeout(timeout as NodeJS.Timeout)
    // Disable exhaustive deps as this only needs to be aware of the softLoading prop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSoftLoading])

  return <LoadingCowImg showLoader={showCow} {...rest} />
}

export interface SwapProps extends RouteComponentProps {
  FeeGreaterMessage: React.FC<FeeGreaterMessageProp>
  EthWethWrapMessage: React.FC<EthWethWrapProps>
  SwitchToWethBtn: React.FC<SwitchToWethBtnProps>
  FeesExceedFromAmountMessage: React.FC
  BottomGrouping: React.FC
  TradeLoading: React.FC<TradeLoadingProps>
  SwapButton: React.FC<SwapButtonProps>
  // LoadingCow: typeof LoadingCow
  className?: string
}

function FeeGreaterMessage({ fee }: FeeGreaterMessageProp) {
  const theme = useContext(ThemeContext)

  return (
    <RowBetween>
      <RowFixed>
        <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
          Fee
        </TYPE.black>
        <QuestionHelper text="GP Swap has 0 gas fees. A portion of the sell amount in each trade goes to the GP Protocol." />
      </RowFixed>
      <TYPE.black fontSize={14} color={theme.text1}>
        {fee.toSignificant(4)} {fee.currency.symbol}
      </TYPE.black>
    </RowBetween>
  )
}

function EthWethWrapMessage(props: EthWethWrapProps) {
  return (
    <RowBetween>
      <EthWethWrap {...props} />
    </RowBetween>
  )
}

interface SwitchToWethBtnProps {
  wrappedToken: Token
}

function SwitchToWethBtn({ wrappedToken }: SwitchToWethBtnProps) {
  const replaceSwapState = useReplaceSwapState()
  const { independentField, typedValue, OUTPUT } = useSwapState()

  return (
    <ButtonPrimary
      buttonSize={ButtonSize.BIG}
      id="swap-button"
      onClick={() =>
        replaceSwapState({
          inputCurrencyId: wrappedToken.address,
          outputCurrencyId: OUTPUT.currencyId,
          typedValue,
          recipient: null,
          field: independentField
        })
      }
    >
      <TYPE.main mb="4px">Switch to {wrappedToken.symbol}</TYPE.main>
    </ButtonPrimary>
  )
}

function FeesExceedFromAmountMessage() {
  return (
    <RowBetween>
      <ButtonError buttonSize={ButtonSize.BIG} error id="swap-button" disabled>
        <Text fontSize={20} fontWeight={500}>
          Fees exceed from amount
        </Text>
      </ButtonError>
    </RowBetween>
  )
}

const CenteredDots = styled(Dots)<{ smaller?: boolean }>`
  vertical-align: ${({ smaller = false }) => (smaller ? 'normal' : 'super')};
`

const LongLoadText = styled.span`
  animation: fadeIn 0.42s ease-in;

  ${fadeIn}
`

const LONG_LOAD_THRESHOLD = 4000

type TradeLoadingProps = {
  showButton?: boolean
}

const TradeLoading = ({ showButton = false }: TradeLoadingProps) => {
  const [isLongLoad, setIsLongLoad] = useState<boolean>(false)

  // change message if user waiting too long
  useEffect(() => {
    const timeout = setTimeout(() => setIsLongLoad(true), LONG_LOAD_THRESHOLD)

    return () => clearTimeout(timeout)
  }, [])

  const InsideContent = useCallback(
    () => (
      <TYPE.main display="flex" alignItems="center" maxHeight={20}>
        <Text fontSize={isLongLoad ? 14 : 40} fontWeight={500}>
          {isLongLoad && <LongLoadText>Hang in there. Calculating best price </LongLoadText>}
          <CenteredDots smaller={isLongLoad} />
        </Text>
      </TYPE.main>
    ),
    [isLongLoad]
  )

  return showButton ? (
    <ButtonError id="swap-button" buttonSize={ButtonSize.BIG} disabled={true} maxHeight={60}>
      {InsideContent()}
    </ButtonError>
  ) : (
    InsideContent()
  )
}

interface SwapButtonProps extends TradeLoadingProps {
  isHardLoading: boolean
  isSoftLoading: boolean
  children: React.ReactNode
}

const SwapButton = ({ children, isHardLoading, isSoftLoading, showButton = false }: SwapButtonProps) =>
  isHardLoading ? (
    <TradeLoading showButton={showButton} />
  ) : (
    <Text fontSize={16} fontWeight={500}>
      {children} {<LoadingCow src={loadingCow} isSoftLoading={isSoftLoading} maxWidth="20px" />}
    </Text>
  )

export default function Swap(props: RouteComponentProps) {
  return (
    <SwapModWrapper
      FeeGreaterMessage={FeeGreaterMessage}
      EthWethWrapMessage={EthWethWrapMessage}
      SwitchToWethBtn={SwitchToWethBtn}
      FeesExceedFromAmountMessage={FeesExceedFromAmountMessage}
      BottomGrouping={BottomGrouping}
      SwapButton={SwapButton}
      TradeLoading={TradeLoading}
      // LoadingCow={LoadingCow}
      {...props}
    />
  )
}
