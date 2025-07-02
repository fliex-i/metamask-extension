import { useSelector } from 'react-redux';
import { BN } from 'bn.js';
import { Token } from '@metamask/assets-controllers';
import { getAllTokens } from '../selectors';
import { getCurrentChainId } from '../../shared/modules/selectors/networks';
import { hexToDecimal } from '../../shared/modules/conversion.utils';

import { TokenWithBalance } from '../components/multichain/asset-picker-amount/asset-picker-modal/types';
import { stringifyBalance, useTokenBalances } from './useTokenBalances';

type AddressMapping = {
  [chainId: string]: {
    [tokenAddress: string]: string;
  };
};

type TokenBalancesMapping = {
  [address: string]: AddressMapping;
};

export const useGetFormattedTokensPerChain = (
  account: { address: string },
  shouldHideZeroBalanceTokens: boolean,
  shouldGetTokensPerCurrentChain: boolean,
  allChainIDs: string[],
) => {
  const currentChainId = useSelector(getCurrentChainId);

  const importedTokens = useSelector(getAllTokens); // returns the tokens only when they are imported
  const currentTokenBalances: { tokenBalances: TokenBalancesMapping } =
    useTokenBalances({
      chainIds: allChainIDs as `0x${string}`[],
    });

  // We will calculate aggregated balance only after the user imports the tokens to the wallet
  // we need to format the balances we get from useTokenBalances and match them with symbol and decimals we get from getAllTokens
  const networksToFormat = shouldGetTokensPerCurrentChain
    ? [currentChainId]
    : allChainIDs;
  const formattedTokensWithBalancesPerChain = networksToFormat.map(
    (singleChain) => {
      const tokens = importedTokens?.[singleChain]?.[account?.address] ?? [];

      const tokensWithBalances = tokens.reduce(
        (acc: TokenWithBalance[], token: Token) => {
          const hexBalance =
            currentTokenBalances.tokenBalances[account.address]?.[
              singleChain
            ]?.[token.address] ?? '0x0';
          if (hexBalance !== '0x0' || !shouldHideZeroBalanceTokens) {
            const decimalBalance = hexToDecimal(hexBalance);
            acc.push({
              address: token.address,
              symbol: token.symbol,
              decimals: token.decimals,
              balance: decimalBalance,
              string: stringifyBalance(
                new BN(decimalBalance),
                new BN(token.decimals),
              ),
            });
          }
          return acc;
        },
        [],
      );

      // 自动补全主流链USDT
      const USDT_TOKEN_MAP: Record<string, TokenWithBalance> = {
        // Ethereum Mainnet
        '0x1': {
          address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          symbol: 'USDT',
          decimals: 6,
          balance: '0',
          string: '0',
        },
        // BSC
        '0x38': {
          address: '0x55d398326f99059fF775485246999027B3197955',
          symbol: 'USDT',
          decimals: 18,
          balance: '0',
          string: '0',
        },
        // Polygon
        '0x89': {
          address: '0x3813e82e6f7098b9583FC0F33a962D02018B6803',
          symbol: 'USDT',
          decimals: 6,
          balance: '0',
          string: '0',
        },
        // Arbitrum One
        '0xa4b1': {
          address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
          symbol: 'USDT',
          decimals: 6,
          balance: '0',
          string: '0',
        },
        // Optimism
        '0xa': {
          address: '0x4200000000000000000000000000000000000006',
          symbol: 'USDT',
          decimals: 6,
          balance: '0',
          string: '0',
        },
      };
      const usdtToken = USDT_TOKEN_MAP[singleChain];
      if (usdtToken) {
        // 查询链上 USDT 余额
        const usdtHexBalance =
          currentTokenBalances.tokenBalances[account.address]?.[singleChain]?.[
            usdtToken.address
          ] ?? '0x0';
        const usdtDecimalBalance = hexToDecimal(usdtHexBalance);
        // 只有余额大于0或不隐藏0资产时才补全
        if (
          (usdtDecimalBalance !== '0' || !shouldHideZeroBalanceTokens) &&
          !tokensWithBalances.some(
            (t: TokenWithBalance) =>
              t.address.toLowerCase() === usdtToken.address.toLowerCase(),
          )
        ) {
          tokensWithBalances.push({
            ...usdtToken,
            balance: usdtDecimalBalance,
            string: stringifyBalance(
              new BN(usdtDecimalBalance),
              new BN(usdtToken.decimals),
            ),
          });
        }
      }

      return {
        chainId: singleChain,
        tokensWithBalances,
      };
    },
  );

  return {
    formattedTokensWithBalancesPerChain,
  };
};
