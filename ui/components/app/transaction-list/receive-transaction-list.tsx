import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getSelectedAccount } from '../../../selectors';
import {
  getCurrentCurrency,
  getCurrencyRates,
  getConversionRate,
} from '../../../ducks/metamask/metamask';
import {
  Box,
  Text,
  AvatarIcon,
  AvatarIconSize,
  IconName,
  Button,
  ModalOverlay,
  ModalHeader,
  ModalFooter,
  ButtonLink,
  ButtonLinkSize,
  Icon,
  IconSize,
  ButtonSize,
  ButtonVariant,
} from '../../component-library';
import {
  BackgroundColor,
  BorderColor,
  BorderRadius,
  Display,
  JustifyContent,
  AlignItems,
  TextAlign,
  TextVariant,
  TextColor,
  IconColor,
  FontWeight,
  BlockSize,
  FlexDirection,
} from '../../../helpers/constants/design-system';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { ActivityListItem } from '../../multichain/activity-list-item/activity-list-item';
import TransactionStatusLabel from '../transaction-status-label/transaction-status-label';
import { useTokenFiatAmount } from '../../../hooks/useTokenFiatAmount';
import { formatCurrency } from '../../../helpers/utils/confirm-tx.util';
import { getCurrentLocale } from '../../../ducks/locale/locale';
import { getTokenExchangeRates, getMarketData } from '../../../selectors';
import { Modal, ModalContent, ModalContentSize } from '../../component-library';
import { AvatarToken, AvatarTokenSize } from '../../component-library';

// Composite icon component for receive transactions
const ReceiveTransactionIcon = ({
  isNative,
  symbol,
}: {
  isNative: boolean;
  symbol: string | null;
}) => {
  // For native tokens, use ETH logo
  const tokenSrc = './images/eth_logo.svg';

  return (
    <Box
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Main receive icon - light purple background with dark blue arrow */}
      <AvatarIcon
        backgroundColor={BackgroundColor.primaryMuted}
        iconName={IconName.Received}
        size={AvatarIconSize.Md}
        color={IconColor.primaryDefault}
      />
      {/* Token icon overlay - small dark blue square with rounded corners */}
      <img
        src={tokenSrc}
        alt="token"
        style={{
          position: 'absolute',
          bottom: '0px',
          right: '-5px',
          width: '16px',
          height: '16px',
          borderRadius: '6px',
        }}
      />
    </Box>
  );
};

// Simple divider component
const Divider = () => (
  <Box paddingTop={4} paddingBottom={4}>
    <Box
      style={{
        marginLeft: '-16px',
        marginRight: '-16px',
        height: '1px',
        backgroundColor: BorderColor.borderMuted,
      }}
    />
  </Box>
);

interface TransferData {
  block_num: number;
  datetime: string;
  timestamp: number;
  transaction_id: string;
  contract: string;
  from: string;
  to: string;
  decimals: number;
  symbol: string;
  value: number;
}

interface ReceiveTransactionListProps {
  boxProps?: any;
}

const THE_GRAPH_API_TOKEN =
  'eyJhbGciOiJLTVNFUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3OTAxMDM5OTAsImp0aSI6IjE2MzliZjJjLTZiYTktNGE2Zi04N2NlLTBmNTE5ODFlYjUwMCIsImlhdCI6MTc1NDEwMzk5MCwiaXNzIjoiZGZ1c2UuaW8iLCJzdWIiOiIwdG92eTJjN2YwZjc3ZTBkYTAzMzYiLCJ2IjoxLCJha2kiOiIwMTVkNDg2NDY3OWQwYTE3MjNlZTllY2M2NmQ0MWZlNjgyNjY0MDU5ZDBhOTY2MjA3MGViZGEyYjZmZTk0MzU1IiwidWlkIjoiMHRvdnkyYzdmMGY3N2UwZGEwMzM2In0.UCJO6__NLbDkAq9Y0SAnJ39prldkZV1cEHZU7ZD3UCFfsZ_u_Kjdk_z0t5UorI9wEAKUyi9QlXvavQ1PZ214Dg';

export const ReceiveTransactionList: React.FC<ReceiveTransactionListProps> = ({
  boxProps,
}) => {
  const [transfers, setTransfers] = useState<TransferData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [selectedTransfer, setSelectedTransfer] = useState<TransferData | null>(
    null,
  );
  const [showDetails, setShowDetails] = useState(false);
  const t = useI18nContext();
  const selectedAccount = useSelector(getSelectedAccount);
  const currentCurrency = useSelector(getCurrentCurrency);
  const currencyRates = useSelector(getCurrencyRates);
  const conversionRate = useSelector(getConversionRate);
  const currentLocale = useSelector(getCurrentLocale);
  const tokenExchangeRates = useSelector(getTokenExchangeRates);
  const marketData = useSelector(getMarketData);

  const fetchReceiveTransactions = async () => {
    if (!selectedAccount?.address) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://token-api.thegraph.com/transfers/evm?network_id=mainnet&to=${selectedAccount.address}&orderBy=timestamp&orderDirection=desc&limit=50&page=1`,
        {
          headers: {
            Authorization: `Bearer ${THE_GRAPH_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTransfers(data.data || []);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      console.error('Error fetching receive transactions:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to fetch transactions',
      );
      setRetryCount((prev) => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceiveTransactions();
  }, [selectedAccount?.address]);

  const groupedTransfers = useMemo(() => {
    const groups: { [key: string]: TransferData[] } = {};

    transfers.forEach((transfer) => {
      const date = new Date(transfer.datetime);
      const dateKey = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(transfer);
    });

    return Object.entries(groups).sort(
      ([a], [b]) => new Date(b).getTime() - new Date(a).getTime(),
    );
  }, [transfers]);

  // 移除调试日志

  const isNativeToken = (contract: string, symbol: string) => {
    // 主币的合约地址通常是 0x0000000000000000000000000000000000000000 或空字符串
    const isZeroAddress =
      !contract || contract === '0x0000000000000000000000000000000000000000';

    // 常见的主币符号（包括 null 的情况）
    const nativeSymbols = [
      'ETH',
      'MATIC',
      'BNB',
      'AVAX',
      'FTM',
      'ARB',
      'OP',
      null,
      undefined,
    ];

    return isZeroAddress || nativeSymbols.includes(symbol);
  };

  const formatValue = (value: number) => {
    // 移除末尾的0，保持合理的精度
    const formatted = value.toString();

    // 如果是整数，直接返回
    if (Number.isInteger(value)) {
      return formatted;
    }

    // 移除末尾的0
    return formatted.replace(/\.?0+$/, '');
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleTransactionClick = (transfer: TransferData) => {
    // 打开交易详情弹窗
    setSelectedTransfer(transfer);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedTransfer(null);
  };

  if (loading) {
    return (
      <Box
        {...boxProps}
        display={Display.Flex}
        flexDirection={FlexDirection.Column}
        justifyContent={JustifyContent.center}
        alignItems={AlignItems.center}
        padding={4}
        gap={2}
      >
        <Text variant={TextVariant.bodyMd} color={TextColor.textDefault}>
          {t('loading')}...
        </Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        {...boxProps}
        display={Display.Flex}
        flexDirection={FlexDirection.Column}
        justifyContent={JustifyContent.center}
        alignItems={AlignItems.center}
        padding={4}
        gap={2}
      >
        <Text
          variant={TextVariant.bodyMd}
          color={TextColor.errorDefault}
          textAlign={TextAlign.Center}
        >
          {t('error')}: {error}
        </Text>
        {retryCount < 3 && (
          <Button onClick={fetchReceiveTransactions} type="primary">
            {t('tryAgain')}
          </Button>
        )}
      </Box>
    );
  }

  if (transfers.length === 0) {
    return (
      <Box className="transaction-list__empty">
        <Box
          as="img"
          src="./images/clock.png"
          className="transaction-list__empty-icon"
        />
        <Box className="transaction-list__empty-title">
          {t('noTransactionsTitle')}
        </Box>
        <Box className="transaction-list__empty-text">
          {t('youareNoTransactions')}
        </Box>
      </Box>
    );
  }

  return (
    <Box className="receive-transaction-list" {...boxProps}>
      <Box className="receive-transaction-list__transactions">
        {groupedTransfers.map(([date, dateTransfers]) => (
          <Box key={date} className="receive-transaction-list__date-group">
            <Text
              paddingTop={4}
              paddingInline={4}
              variant={TextVariant.bodyMd}
              color={TextColor.textDefault}
              fontWeight={FontWeight.Medium}
            >
              {date}
            </Text>
            {dateTransfers.map((transfer, index) => {
              const isNative = isNativeToken(
                transfer.contract,
                transfer.symbol,
              );

              // 使用项目的标准方式计算法币价值
              let fiatValue = '0.00';

              if (conversionRate && conversionRate > 0) {
                if (isNative) {
                  // 主币使用 conversionRate
                  const usdValue = transfer.value * conversionRate;

                  // 确保 usdValue 不为 0
                  if (usdValue > 0) {
                    fiatValue = formatCurrency(
                      usdValue.toString(),
                      currentCurrency,
                    );
                  } else {
                    fiatValue = '0.00';
                  }
                } else {
                  // 对于代币，使用真实的汇率数据
                  let tokenExchangeRate = null;

                  // 从 tokenExchangeRates 中查找代币汇率
                  const tokenKey = Object.keys(tokenExchangeRates).find(
                    (key) =>
                      key.toLowerCase() === transfer.contract.toLowerCase(),
                  );

                  if (tokenKey) {
                    tokenExchangeRate = (tokenExchangeRates as any)[tokenKey];
                  } else {
                    // 如果找不到，尝试从 marketData 中获取
                    const chainMarketData = (marketData as any)['1']; // mainnet
                    if (chainMarketData && chainMarketData[transfer.contract]) {
                      tokenExchangeRate =
                        chainMarketData[transfer.contract].price;
                    }
                  }

                  // 如果找到了代币汇率，使用它进行转换
                  if (tokenExchangeRate && tokenExchangeRate > 0) {
                    const usdValue =
                      transfer.value * tokenExchangeRate * conversionRate;
                    fiatValue = formatCurrency(
                      usdValue.toString(),
                      currentCurrency,
                    );
                  } else {
                    // 如果找不到汇率，使用稳定币的默认汇率
                    const stablecoinRates: { [key: string]: number } = {
                      USDT: 1,
                      USDC: 1,
                      DAI: 1,
                      BUSD: 1,
                      TUSD: 1,
                    };

                    if (stablecoinRates[transfer.symbol]) {
                      const usdValue =
                        transfer.value * stablecoinRates[transfer.symbol];
                      fiatValue = formatCurrency(
                        usdValue.toString(),
                        currentCurrency,
                      );
                    } else {
                      // 其他代币暂时显示为 0
                      fiatValue = '0.00';
                    }
                  }
                }
              } else {
                if (isNative) {
                  // 对于主币，使用简单的估算（假设 1 ETH = 3000 USD）
                  const estimatedRate = 3000;
                  const usdValue = transfer.value * estimatedRate;
                  fiatValue = formatCurrency(
                    usdValue.toString(),
                    currentCurrency,
                  );
                } else {
                  // 对于代币，使用稳定币汇率
                  const stablecoinRates: { [key: string]: number } = {
                    USDT: 1,
                    USDC: 1,
                    DAI: 1,
                    BUSD: 1,
                    TUSD: 1,
                  };

                  if (stablecoinRates[transfer.symbol]) {
                    const usdValue =
                      transfer.value * stablecoinRates[transfer.symbol];
                    fiatValue = formatCurrency(
                      usdValue.toString(),
                      currentCurrency,
                    );
                  } else {
                    fiatValue = '0.00';
                  }
                }
              }

              return (
                <ActivityListItem
                  key={`${transfer.transaction_id}-${index}`}
                  data-testid="receive-transaction-item"
                  onClick={() => handleTransactionClick(transfer)}
                  icon={
                    <ReceiveTransactionIcon
                      isNative={isNative}
                      symbol={transfer.symbol}
                    />
                  }
                  title={`${t('receives')}`}
                  subtitle={
                    <TransactionStatusLabel
                      status="confirmed"
                      statusOnly
                      date={new Date(transfer.datetime).toLocaleDateString(
                        'en-US',
                        {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        },
                      )}
                    />
                  }
                  rightContent={
                    <>
                      <Text
                        variant={TextVariant.bodyLgMedium}
                        fontWeight={FontWeight.Medium}
                        color={TextColor.textDefault}
                        textAlign={TextAlign.Right}
                        data-testid="transaction-list-item-primary-currency"
                        className="activity-list-item__primary-currency"
                        ellipsis
                      >
                        +{formatValue(transfer.value)}{' '}
                        {transfer.symbol || (isNative ? 'ETH' : 'TOKEN')}
                      </Text>
                      <Text
                        variant={TextVariant.bodyMd}
                        color={TextColor.textAlternative}
                        textAlign={TextAlign.Right}
                        data-testid="transaction-list-item-secondary-currency"
                      >
                        +{fiatValue} {currentCurrency.toUpperCase()}
                      </Text>
                    </>
                  }
                />
              );
            })}
          </Box>
        ))}
      </Box>
      {showDetails && selectedTransfer && (
        <Modal isOpen={showDetails} onClose={handleCloseDetails}>
          <ModalOverlay />
          <ModalContent
            modalDialogProps={{
              display: Display.Flex,
              flexDirection: FlexDirection.Column,
              padding: 4,
            }}
          >
            <ModalHeader onClose={handleCloseDetails} padding={0}>
              <Text
                variant={TextVariant.headingMd}
                textAlign={TextAlign.Left}
                style={{ fontSize: '18px' }}
              >
                {t('receives')}
              </Text>
            </ModalHeader>

            <Divider />

            <Box>
              <Box
                display={Display.Flex}
                flexDirection={FlexDirection.Column}
                gap={4}
              >
                <Box
                  display={Display.Flex}
                  justifyContent={JustifyContent.spaceBetween}
                >
                  <Text
                    variant={TextVariant.bodyMd}
                    fontWeight={FontWeight.Medium}
                  >
                    {t('bridgeTxDetailsStatus')}
                  </Text>
                  <ButtonLink
                    size={ButtonLinkSize.Inherit}
                    textProps={{
                      variant: TextVariant.bodySm,
                      color: TextColor.primaryDefault,
                    }}
                    as="a"
                    externalLink
                    href={`https://etherscan.io/tx/${selectedTransfer.transaction_id}`}
                  >
                    {t('viewOnBlockExplorer')}
                  </ButtonLink>
                </Box>
                {/* Status */}
                <Box
                  display={Display.Flex}
                  justifyContent={JustifyContent.spaceBetween}
                >
                  <Text
                    variant={TextVariant.bodyMd}
                    fontWeight={FontWeight.Medium}
                  >
                    {t('confirmed')}
                  </Text>
                  <Text
                    variant={TextVariant.bodyMd}
                    color={TextColor.primaryDefault}
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      navigator.clipboard.writeText(
                        selectedTransfer.transaction_id,
                      );
                    }}
                  >
                    {t('copyTransactionId')}
                  </Text>
                </Box>

                {/* From */}
                <Box
                  display={Display.Flex}
                  justifyContent={JustifyContent.spaceBetween}
                >
                  <Text
                    variant={TextVariant.bodyMd}
                    fontWeight={FontWeight.Medium}
                  >
                    {t('from')}
                  </Text>
                  <Box
                    display={Display.Flex}
                    alignItems={AlignItems.center}
                    gap={1}
                  >
                    <ButtonLink
                      size={ButtonLinkSize.Inherit}
                      textProps={{
                        variant: TextVariant.bodyMd,
                        alignItems: AlignItems.flexStart,
                      }}
                      as="a"
                      externalLink
                      href={`https://etherscan.io/address/${selectedTransfer.from}`}
                    >
                      {shortenAddress(selectedTransfer.from)}
                      <Icon
                        marginLeft={2}
                        name={IconName.Export}
                        size={IconSize.Sm}
                        color={IconColor.primaryDefault}
                      />
                    </ButtonLink>
                  </Box>
                </Box>

                {/* To */}
                <Box
                  display={Display.Flex}
                  justifyContent={JustifyContent.spaceBetween}
                >
                  <Text
                    variant={TextVariant.bodyMd}
                    fontWeight={FontWeight.Medium}
                  >
                    {t('to')}
                  </Text>
                  <Box
                    display={Display.Flex}
                    alignItems={AlignItems.center}
                    gap={1}
                  >
                    <ButtonLink
                      size={ButtonLinkSize.Inherit}
                      textProps={{
                        variant: TextVariant.bodyMd,
                        alignItems: AlignItems.flexStart,
                      }}
                      as="a"
                      externalLink
                      href={`https://etherscan.io/address/${selectedTransfer.to}`}
                    >
                      {shortenAddress(selectedTransfer.to)}
                      <Icon
                        marginLeft={2}
                        name={IconName.Export}
                        size={IconSize.Sm}
                        color={IconColor.primaryDefault}
                      />
                    </ButtonLink>
                  </Box>
                </Box>
              </Box>

              <Divider />

              <Box
                display={Display.Flex}
                flexDirection={FlexDirection.Column}
                gap={4}
              >
                {/* Transaction Section */}
                <Text
                  variant={TextVariant.bodyMd}
                  fontWeight={FontWeight.Medium}
                >
                  {t('transaction')}
                </Text>

                {/* Amount */}
                <Box
                  display={Display.Flex}
                  justifyContent={JustifyContent.spaceBetween}
                >
                  <Text
                    variant={TextVariant.bodyMd}
                    fontWeight={FontWeight.Medium}
                  >
                    {t('amount')}
                  </Text>
                  <Box
                    display={Display.Flex}
                    flexDirection={FlexDirection.Column}
                    alignItems={AlignItems.flexEnd}
                  >
                    <Text variant={TextVariant.bodyMd}>
                      +{formatValue(selectedTransfer.value)}{' '}
                      {selectedTransfer.symbol ||
                        (isNativeToken(
                          selectedTransfer.contract,
                          selectedTransfer.symbol,
                        )
                          ? 'ETH'
                          : 'TOKEN')}
                    </Text>
                    {/* Calculate fiat value for display */}
                    {(() => {
                      const isNative = isNativeToken(
                        selectedTransfer.contract,
                        selectedTransfer.symbol,
                      );
                      let fiatValue = '0.00';

                      if (conversionRate && conversionRate > 0) {
                        if (isNative) {
                          const usdValue =
                            selectedTransfer.value * conversionRate;
                          if (usdValue > 0) {
                            fiatValue = formatCurrency(
                              usdValue.toString(),
                              currentCurrency,
                            );
                          }
                        } else {
                          let tokenExchangeRate = null;
                          const tokenKey = Object.keys(tokenExchangeRates).find(
                            (key) =>
                              key.toLowerCase() ===
                              selectedTransfer.contract.toLowerCase(),
                          );

                          if (tokenKey) {
                            tokenExchangeRate = (tokenExchangeRates as any)[
                              tokenKey
                            ];
                          } else {
                            const chainMarketData = (marketData as any)['1'];
                            if (
                              chainMarketData &&
                              chainMarketData[selectedTransfer.contract]
                            ) {
                              tokenExchangeRate =
                                chainMarketData[selectedTransfer.contract]
                                  .price;
                            }
                          }

                          if (tokenExchangeRate && tokenExchangeRate > 0) {
                            const usdValue =
                              selectedTransfer.value *
                              tokenExchangeRate *
                              conversionRate;
                            fiatValue = formatCurrency(
                              usdValue.toString(),
                              currentCurrency,
                            );
                          } else {
                            const stablecoinRates: { [key: string]: number } = {
                              USDT: 1,
                              USDC: 1,
                              DAI: 1,
                              BUSD: 1,
                              TUSD: 1,
                            };
                            if (stablecoinRates[selectedTransfer.symbol]) {
                              const usdValue =
                                selectedTransfer.value *
                                stablecoinRates[selectedTransfer.symbol];
                              fiatValue = formatCurrency(
                                usdValue.toString(),
                                currentCurrency,
                              );
                            }
                          }
                        }
                      }

                      return (
                        <Text
                          variant={TextVariant.bodySm}
                          color={TextColor.textAlternative}
                        >
                          +{fiatValue} {currentCurrency.toUpperCase()}
                        </Text>
                      );
                    })()}
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* <Divider /> */}

            {/* <ModalFooter>
              <Button
                block
                size={ButtonSize.Md}
                variant={ButtonVariant.Link}
                onClick={() => {
                  const etherscanUrl = `https://etherscan.io/tx/${selectedTransfer.transaction_id}`;
                  window.open(etherscanUrl, '_blank');
                }}
                endIconName={IconName.Export}
              >
                {t('viewDetails')}
              </Button>
            </ModalFooter> */}
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
};
