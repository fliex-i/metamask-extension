import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { MetaMetricsContext } from '../../../contexts/metametrics';
import { I18nContext } from '../../../contexts/i18n';
import { CoinOverview } from './coin-overview';
import { InternalAccount } from '@metamask/keyring-internal-api';
import { EthAccountType, EthScope } from '@metamask/keyring-api';
import { ETH_EOA_METHODS } from '../../../../shared/constants/eth-methods';

// Mock the multichainUpdateBalance action
jest.mock('../../../store/actions', () => ({
  ...jest.requireActual('../../../store/actions'),
  multichainUpdateBalance: jest.fn(() => Promise.resolve()),
}));

// Mock the submitRequestToBackground function
jest.mock('../../../store/background-connection', () => ({
  ...jest.requireActual('../../../store/background-connection'),
  submitRequestToBackground: jest.fn(() => Promise.resolve()),
}));

const mockStore = configureMockStore([thunk]);

const mockAccount: InternalAccount = {
  id: 'test-account-id',
  address: '0x1234567890123456789012345678901234567890',
  type: EthAccountType.Eoa,
  metadata: {
    name: 'Test Account',
    importTime: Date.now(),
    keyring: {
      type: 'HD Key Tree',
    },
  },
  options: {},
  scopes: [EthScope.Eoa],
  methods: ETH_EOA_METHODS,
};

const mockState = {
  metamask: {
    accounts: {
      [mockAccount.address]: {
        address: mockAccount.address,
        balance: '0x1000000000000000000',
      },
    },
    preferences: {
      privacyMode: false,
      showNativeTokenAsMainBalance: false,
    },
    tokens: [],
    tokenBalances: {},
    conversionRates: {},
    currentCurrency: 'usd',
    localeMessages: {},
    selectedAddress: mockAccount.address,
    internalAccounts: {
      [mockAccount.id]: mockAccount,
    },
    selectedInternalAccount: mockAccount,
    multichainBalances: {
      [mockAccount.id]: {},
    },
    multichainAssets: {
      accountsAssets: {
        [mockAccount.id]: [],
      },
    },
    multichainAssetsRates: {
      conversionRates: {},
    },
    multichainNetwork: {
      chainId: 'eip155:1',
      network: {
        ticker: 'ETH',
      },
    },
    isEvmSelected: true,
    chainIdsToPoll: ['0x1'],
    shouldHideZeroBalanceTokens: false,
    isTokenNetworkFilterEqualCurrentNetwork: true,
    tokensMarketData: {},
    isTestnet: false,
    dataCollectionForMarketing: false,
    participateInMetaMetrics: false,
    metaMetricsId: 'test-metrics-id',
  },
};

const mockT = jest.fn((key) => key);

const mockTrackEvent = jest.fn();

const renderWithProviders = (component: React.ReactElement, initialState = mockState) => {
  const store = mockStore(initialState);

  return render(
    <Provider store={store}>
      <I18nContext.Provider value={mockT}>
        <MetaMetricsContext.Provider value={mockTrackEvent}>
          {component}
        </MetaMetricsContext.Provider>
      </I18nContext.Provider>
    </Provider>
  );
};

describe('CoinOverview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderWithProviders(
      <CoinOverview
        account={mockAccount}
        balance="0x1000000000000000000"
        balanceIsCached={false}
        chainId="eip155:1"
        isBridgeChain={false}
        isBuyableChain={true}
        isSwapsChain={true}
        isSigningEnabled={true}
        defaultSwapsToken={{
          address: '0x0000000000000000000000000000000000000000',
          symbol: 'ETH',
          decimals: '18',
          name: 'Ether',
          balance: '1000000000000000000',
          string: '1.0000',
        }}
      />
    );

    expect(screen.getByText('totalBalance')).toBeInTheDocument();
  });

  it('shows reload icon', () => {
    renderWithProviders(
      <CoinOverview
        account={mockAccount}
        balance="0x1000000000000000000"
        balanceIsCached={false}
        chainId="eip155:1"
        isBridgeChain={false}
        isBuyableChain={true}
        isSwapsChain={true}
        isSigningEnabled={true}
        defaultSwapsToken={{
          address: '0x0000000000000000000000000000000000000000',
          symbol: 'ETH',
          decimals: '18',
          name: 'Ether',
          balance: '1000000000000000000',
          string: '1.0000',
        }}
      />
    );

    const reloadButton = screen.getByTestId('refresh-balance-button');
    expect(reloadButton).toBeInTheDocument();
  });

  it('handles reload button click for EVM network', async () => {
    const { multichainUpdateBalance } = require('../../../store/actions');
    const { submitRequestToBackground } = require('../../../store/background-connection');

    renderWithProviders(
      <CoinOverview
        account={mockAccount}
        balance="0x1000000000000000000"
        balanceIsCached={false}
        chainId="eip155:1"
        isBridgeChain={false}
        isBuyableChain={true}
        isSwapsChain={true}
        isSigningEnabled={true}
        defaultSwapsToken={{
          address: '0x0000000000000000000000000000000000000000',
          symbol: 'ETH',
          decimals: '18',
          name: 'Ether',
          balance: '1000000000000000000',
          string: '1.0000',
        }}
      />
    );

    const reloadButton = screen.getByTestId('refresh-balance-button');

    fireEvent.click(reloadButton);

    // Wait for the refresh to complete
    await waitFor(() => {
      expect(multichainUpdateBalance).toHaveBeenCalledWith(mockAccount.id);
    });

    expect(submitRequestToBackground).toHaveBeenCalledWith('updateAccounts', []);
  });

  it('handles reload button click for non-EVM network', async () => {
    const { multichainUpdateBalance } = require('../../../store/actions');
    const { submitRequestToBackground } = require('../../../store/background-connection');

    const nonEvmState = {
      ...mockState,
      metamask: {
        ...mockState.metamask,
        isEvmSelected: false,
        multichainNetwork: {
          chainId: 'solana:mainnet',
          network: {
            ticker: 'SOL',
          },
        },
      },
    };

    renderWithProviders(
      <CoinOverview
        account={mockAccount}
        balance="0x1000000000000000000"
        balanceIsCached={false}
        chainId="solana:mainnet"
        isBridgeChain={false}
        isBuyableChain={true}
        isSwapsChain={false}
        isSigningEnabled={true}
      />,
      nonEvmState
    );

    const reloadButton = screen.getByTestId('refresh-balance-button');

    fireEvent.click(reloadButton);

    // Wait for the refresh to complete
    await waitFor(() => {
      expect(multichainUpdateBalance).toHaveBeenCalledWith(mockAccount.id);
    });

    // Should not call updateAccounts for non-EVM networks
    expect(submitRequestToBackground).not.toHaveBeenCalled();
  });

  it('prevents multiple simultaneous refreshes', async () => {
    const { multichainUpdateBalance } = require('../../../store/actions');

    renderWithProviders(
      <CoinOverview
        account={mockAccount}
        balance="0x1000000000000000000"
        balanceIsCached={false}
        chainId="eip155:1"
        isBridgeChain={false}
        isBuyableChain={true}
        isSwapsChain={true}
        isSigningEnabled={true}
        defaultSwapsToken={{
          address: '0x0000000000000000000000000000000000000000',
          symbol: 'ETH',
          decimals: '18',
          name: 'Ether',
          balance: '1000000000000000000',
          string: '1.0000',
        }}
      />
    );

    const reloadButton = screen.getByTestId('refresh-balance-button');

    // Click multiple times rapidly
    fireEvent.click(reloadButton);
    fireEvent.click(reloadButton);
    fireEvent.click(reloadButton);

    // Should only call once due to the isRefreshing guard
    await waitFor(() => {
      expect(multichainUpdateBalance).toHaveBeenCalledTimes(1);
    });
  });

  it('shows spinning animation during refresh', async () => {
    renderWithProviders(
      <CoinOverview
        account={mockAccount}
        balance="0x1000000000000000000"
        balanceIsCached={false}
        chainId="eip155:1"
        isBridgeChain={false}
        isBuyableChain={true}
        isSwapsChain={true}
        isSigningEnabled={true}
        defaultSwapsToken={{
          address: '0x0000000000000000000000000000000000000000',
          symbol: 'ETH',
          decimals: '18',
          name: 'Ether',
          balance: '1000000000000000000',
          string: '1.0000',
        }}
      />
    );

    const reloadButton = screen.getByTestId('refresh-balance-button');

    fireEvent.click(reloadButton);

    // Check if spinning class is applied
    expect(reloadButton).toHaveClass('coin-overview__reload-icon--spinning');
  });
});
