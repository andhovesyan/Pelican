import { ChainId, TokenAmount } from '@pangolindex/sdk'
import React, { useContext, useState } from 'react'
import { Text } from 'rebass'
import { NavLink } from 'react-router-dom'
// import { darken } from 'polished'
import { useTranslation } from 'react-i18next'
import { FaTimes } from 'react-icons/fa'
import styled, { ThemeContext } from 'styled-components'

import Logo from '../../assets/Logo_Exports/Logos/Logo-with-Emblem-BG-Transparent.png'
import LogoDark from '../../assets/Logo_Exports/Logos/Logo-with-Emblem-BG-Transparent-Dark-Background.png'
import { useActiveWeb3React } from '../../hooks'
import { useDarkModeManager } from '../../state/user/hooks'
import { useETHBalances, useAggregatePngBalance } from '../../state/wallet/hooks'
import { CardNoise } from '../earn/styled'
import { CountUp } from 'use-count-up'
import { TYPE } from '../../theme'
import { ImMenu3 } from 'react-icons/im'
import { RedCard } from '../Card'
// import Settings from '../Settings'
// import Menu from '../Menu'

import Row, { RowBetween, RowFixed } from '../Row'
import Web3Status from '../Web3Status'
import Modal from '../Modal'
import PngBalanceContent from './PngBalanceContent'
import usePrevious from '../../hooks/usePrevious'
// import { ANALYTICS_PAGE } from '../../constants'
import LanguageSelection from '../LanguageSelection'
// import Toggle from '../Toggle'
import ToggleNight from '../ToggleNight'

const HeaderFrame = styled.div`
  height: 10vh;
  display: grid;
  grid-template-columns: 1fr 120px;
  align-items: center;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  width: 100%;
  top: 0;
  position: relative;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding: 1rem;
  z-index: 2;
  background-color: ${({ color }) => color};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: 1fr;
    padding: 0 1rem;
    width: calc(100%);
    position: relative;
  `};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
        padding: 0.5rem 1rem;
  `}
`

const HeaderControls = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-self: flex-end;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: row;
    justify-content: space-between;
    justify-self: center;
    width: 100%;
    max-width: 960px;
    padding: 1rem;
    position: fixed;
    bottom: 0px;
    left: 0px;
    width: 100%;
    z-index: 99;
    height: 72px;
    border-radius: 12px 12px 0 0;
    
    background-color: ${({ theme }) => theme.bg1};
    
  `};
`

const HeaderElement = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
   flex-direction: row-reverse;
    align-items: center;
  `};
`

const HeaderElementWrap = styled.div`
  display: flex;
  align-items: center;
`

const HeaderRow = styled(RowFixed)`
  ${({ theme }) => theme.mediaWidth.upToMedium`
   width: 100%;
   display: flex;
   justify-content: space-between;
   align-items: center;
  `};
`

const HeaderLinks = styled(Row)`
  justify-content: center;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem 0 1rem 1rem;
    justify-content: flex-end;
`};
  ${({ theme }) => theme.mediaWidth.upToSmall`
 display: none;
  `};
`

const MobileIconButton = styled.button`
  border: none;
  font-size: 1.5rem;
  padding: 5px;
  cursor: pointer;
  background-color: transparent;
  display: none;
  color: ${({ theme }) => theme.text1};
  ${({ theme }) => theme.mediaWidth.upToSmall`
 display: block;
  `};
`

const AccountElement = styled.div<{ active: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme, active }) => (!active ? theme.bg1 : theme.bg3)};
  border-radius: 12px;
  white-space: nowrap;
  width: 100%;
  cursor: pointer;

  :focus {
    border: 1px solid blue;
  }
  /* :hover {
    background-color: ${({ theme, active }) => (!active ? theme.bg2 : theme.bg4)};
  } */
`

const PNGAmount = styled(AccountElement)`
  color: white;
  padding: 4px 8px;
  height: 36px;
  font-weight: 500;
  background-color: ${({ theme }) => theme.bg3};
  background: radial-gradient(174.47% 188.91% at 1.84% 0%, #f97316 0%, #e84142 100%), #edeef2;
`

const PNGWrapper = styled.span`
  width: fit-content;
  position: relative;
  cursor: pointer;
  :hover {
    opacity: 0.8;
  }
  :active {
    opacity: 0.9;
  }
`

const HideSmall = styled.span`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `};
`

const NetworkCard = styled(RedCard)`
  border-radius: 12px;
  padding: 8px 12px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 0;
    margin-right: 0.5rem;
    width: initial;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 1;
  `};
`

const BalanceText = styled(Text)`
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `};
`

const Title = styled.a`
  display: flex;
  align-items: center;
  pointer-events: auto;
  justify-self: flex-start;
  margin-right: 12px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    justify-self: center;
  `};
  :hover {
    cursor: pointer;
  }
`

const HeaderLinksMobile = styled(Row)`
  display: none;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    position: absolute;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.bg2};
  top: 10vh;
  right: 0;
  width: 60vw;
  justify-content: space-around;
  padding-top: 1rem;
  padding-bottom: 1rem;
  box-shadow: 0 2px 8px black;
  border-radius: 0 0 0 1rem;
  `};
`

const PngIcon = styled.div`
  transition: transform 0.3s ease;
`

const activeClassName = 'ACTIVE'

const StyledNavLink = styled(NavLink).attrs({
  activeClassName
})`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 1rem;
  `};

  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  padding: 0.5rem;
  color: ${({ theme }) => theme.text2};
  font-size: 1rem;
  width: fit-content;
  margin: 0 12px;
  font-weight: 500;

  &.${activeClassName} {
    border-radius: 12px;
    font-weight: 600;
    color: ${({ theme }) => theme.primary1};
  }

  :hover,
  :focus {
    color: ${({ theme }) => theme.primary1};
  }
`

// const StyledExternalLink = styled(ExternalLink).attrs({
//   activeClassName
// })<{ isActive?: boolean }>`
//   ${({ theme }) => theme.flexRowNoWrap}
//   align-items: left;
//   border-radius: 3rem;
//   outline: none;
//   cursor: pointer;
//   text-decoration: none;
//   color: ${({ theme }) => theme.text2};
//   font-size: 1rem;
//   width: fit-content;
//   margin: 0 12px;
//   font-weight: 500;

//   &.${activeClassName} {
//     border-radius: 12px;
//     font-weight: 600;
//     color: ${({ theme }) => theme.text1};
//   }

//   :hover,
//   :focus {
//     text-decoration: none;
//     color: ${({ theme }) => darken(0.1, theme.text1)};
//   }

//   ${({ theme }) => theme.mediaWidth.upToExtraSmall`
//       display: none;
// `}
// `

const NETWORK_LABELS: { [chainId in ChainId]?: string } = {
  [ChainId.FUJI]: 'Fuji',
  [ChainId.AVALANCHE]: 'Avalanche'
}

export interface LendingProps {
  isLending: boolean
  setIsLending: React.Dispatch<React.SetStateAction<boolean>>
}

const Header = () => {
  const { account, chainId } = useActiveWeb3React()
  const { t } = useTranslation()
  const [isLending, setIsLending] = useState(false)

  const theme = useContext(ThemeContext)
  const [darkMode, toggleDarkMode] = useDarkModeManager()
  const [mobileMenu, setMobileMenu] = useState(false)

  const userEthBalance = useETHBalances(account ? [account] : [])?.[account ?? '']
  const [isDark] = useDarkModeManager()

  const aggregateBalance: TokenAmount | undefined = useAggregatePngBalance()

  const [showPngBalanceModal, setShowPngBalanceModal] = useState(false)

  const countUpValue = aggregateBalance?.toFixed(0) ?? '0'
  const countUpValuePrevious = usePrevious(countUpValue) ?? '0'

  const CloseMobileMenu = () => {
    setMobileMenu(!mobileMenu)
  }

  return (
    <HeaderFrame color={isLending ? ' rgba(245, 161, 39, 0.15)' : ''}>
      <Modal isOpen={showPngBalanceModal} onDismiss={() => setShowPngBalanceModal(false)}>
        <PngBalanceContent setShowPngBalanceModal={setShowPngBalanceModal} />
      </Modal>
      <HeaderRow>
        <Title href=".">
          <PngIcon>
            <img width={'220px'} src={isDark ? LogoDark : Logo} alt="logo" />
          </PngIcon>
        </Title>
        {mobileMenu ? (
          <HeaderLinksMobile>
            <StyledNavLink onClick={CloseMobileMenu} id={`swap-nav-link`} to={'/trade'}>
              Trade
            </StyledNavLink>
            <StyledNavLink
              onClick={CloseMobileMenu}
              id={`pool-nav-link`}
              to={'/pool'}
              isActive={(match, { pathname }) =>
                Boolean(match) ||
                pathname.startsWith('/add') ||
                pathname.startsWith('/remove') ||
                pathname.startsWith('/create') ||
                pathname.startsWith('/find')
              }
            >
              {t('header.pool')}
            </StyledNavLink>
            <StyledNavLink
              onClick={CloseMobileMenu}
              id={`png-nav-link`}
              to={'/png/1'}
              isActive={(match, { pathname }) => Boolean(match) || pathname.startsWith('/png')}
            >
              {t('header.farm')}
            </StyledNavLink>
            <StyledNavLink
              to={`/lending`}
              onClick={CloseMobileMenu}
              isActive={(match, { pathname }) => {
                pathname.startsWith('/lending') ? setIsLending(true) : setIsLending(false)
                return Boolean(match) || pathname.startsWith('/lending')
              }}
            >
              Lending
            </StyledNavLink>

            <StyledNavLink
              onClick={CloseMobileMenu}
              id={`stake-nav-link`}
              to={'/stake/0'}
              isActive={(match, { pathname }) => Boolean(match) || pathname.startsWith('/stake')}
            >
              {t('header.stake')}
            </StyledNavLink>
            <StyledNavLink onClick={CloseMobileMenu} id={`vote-nav-link`} to={'/zap'}>
              Zap
            </StyledNavLink>
          </HeaderLinksMobile>
        ) : (
          <HeaderLinks>
            <StyledNavLink id={`swap-nav-link`} to={'/trade'}>
              Trade
            </StyledNavLink>
            <StyledNavLink
              id={`pool-nav-link`}
              to={'/pool'}
              isActive={(match, { pathname }) =>
                Boolean(match) ||
                pathname.startsWith('/add') ||
                pathname.startsWith('/remove') ||
                pathname.startsWith('/create') ||
                pathname.startsWith('/find')
              }
            >
              {t('header.pool')}
            </StyledNavLink>
            {/* <StyledNavLink id={`swap-nav-link`} to={'/buy'}>
            {t('header.buy')}
          </StyledNavLink> */}
            <StyledNavLink
              id={`png-nav-link`}
              to={'/png/1'}
              isActive={(match, { pathname }) => Boolean(match) || pathname.startsWith('/png')}
            >
              {t('header.farm')}
            </StyledNavLink>
            <StyledNavLink
              to={`/lending`}
              isActive={(match, { pathname }) => {
                pathname.startsWith('/lending') ? setIsLending(true) : setIsLending(false)
                return Boolean(match) || pathname.startsWith('/lending')
              }}
            >
              Lending
            </StyledNavLink>
            <StyledNavLink
              id={`stake-nav-link`}
              to={'/stake/0'}
              isActive={(match, { pathname }) => Boolean(match) || pathname.startsWith('/stake')}
            >
              {t('header.stake')}
            </StyledNavLink>
            <StyledNavLink id={`vote-nav-link`} to={'/zap'}>
              Zap
            </StyledNavLink>
            {/* <StyledExternalLink id={`info-nav-link`} href={ANALYTICS_PAGE}>
            {t('header.charts')}
            <span style={{ fontSize: '11px' }}>↗</span>
          </StyledExternalLink>
          <StyledExternalLink id={`gov-nav-link`} href={'https://gov.pangolin.exchange'}>
            {t('header.forum')} <span style={{ fontSize: '11px' }}>↗</span>
          </StyledExternalLink> */}
          </HeaderLinks>
        )}

        <MobileIconButton onClick={CloseMobileMenu}>{mobileMenu ? <FaTimes /> : <ImMenu3 />}</MobileIconButton>
      </HeaderRow>
      <HeaderControls>
        <HeaderElement>
          <RowBetween>
            <RowFixed>
              <TYPE.black fontWeight={400} fontSize={14} color={theme.text1}></TYPE.black>
            </RowFixed>
            <ToggleNight isActive={darkMode} toggle={toggleDarkMode} />
          </RowBetween>
          <HideSmall>
            {chainId && NETWORK_LABELS[chainId] && <NetworkCard title={NETWORK_LABELS[chainId]}>Optimism</NetworkCard>}
          </HideSmall>
          {aggregateBalance && (
            <PNGWrapper onClick={() => setShowPngBalanceModal(true)}>
              <PNGAmount active={!!account} style={{ pointerEvents: 'auto' }}>
                {account && (
                  <HideSmall>
                    <TYPE.white
                      style={{
                        paddingRight: '.4rem'
                      }}
                    >
                      <CountUp
                        key={countUpValue}
                        isCounting
                        start={parseFloat(countUpValuePrevious)}
                        end={parseFloat(countUpValue)}
                        thousandsSeparator={','}
                        duration={1}
                      />
                    </TYPE.white>
                  </HideSmall>
                )}
                PCN
              </PNGAmount>
              <CardNoise />
            </PNGWrapper>
          )}
          <AccountElement active={!!account} style={{ pointerEvents: 'auto' }}>
            {account && userEthBalance ? (
              <BalanceText style={{ flexShrink: 0 }} pl="0.75rem" pr="0.5rem" fontWeight={500}>
                {userEthBalance?.toSignificant(4)} AVAX
              </BalanceText>
            ) : null}
            <Web3Status />
          </AccountElement>
        </HeaderElement>
        <HeaderElementWrap>
          {/* <Settings /> */}
          <LanguageSelection />
          {/* <Menu /> */}
        </HeaderElementWrap>
      </HeaderControls>
    </HeaderFrame>
  )
}

export default Header
