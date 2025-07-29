import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Text } from '../../../component-library';
import {
  Display,
  TextColor,
  TextVariant,
} from '../../../../helpers/constants/design-system';
import { useI18nContext } from '../../../../hooks/useI18nContext';
import { Asset } from '../../../../ducks/send';
import { AssetBalanceText } from './asset-balance-text';
import { getNativeTokenInfo } from '../../../../selectors/selectors';
import { getCurrentChainId } from '../../../../../shared/modules/selectors/networks';
import { AssetType } from '../../../../../shared/constants/transaction';

type AssetBalanceProps = {
  error?: string;
  asset: Asset;
};

export function AssetBalance({ asset, error }: AssetBalanceProps) {
  const t = useI18nContext();

  const balanceColor = error
    ? TextColor.errorDefault
    : TextColor.textAlternative;

  // Get current chain ID
  const currentChainId = useSelector(getCurrentChainId) as string;

  // Get native token info for native assets
  const nativeTokenInfo = useSelector((state) =>
    asset.type === AssetType.native
      ? getNativeTokenInfo(state, currentChainId)
      : null
  ) as { symbol: string; decimals: number; name: string } | null;

  // Get symbol based on asset type
  const getSymbol = () => {
    if (asset.type === AssetType.native) {
      return nativeTokenInfo?.symbol || 'NATIVE';
    }
    if (asset.type === AssetType.token && asset.details?.symbol) {
      return asset.details.symbol;
    }
    return '';
  };

  const symbol = getSymbol();

  return (
    <Box className="asset-picker-amount__balance" display={Display.Flex}>
      <Text color={balanceColor} marginRight={1} variant={TextVariant.bodySm}>
        {symbol} {t('balance')}:
      </Text>

      <AssetBalanceText
        asset={asset}
        balanceColor={balanceColor}
        error={error}
      />
    </Box>
  );
}
