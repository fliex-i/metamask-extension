import React from 'react';
import { NotificationServicesController } from '@metamask/notification-services-controller';
import { useI18nContext } from '../../../../hooks/useI18nContext';
import { type ExtractedNotification, isOfTypeNodeGuard } from '../node-guard';
import {
  NotificationComponentType,
  type NotificationComponent,
} from '../types/notifications/notifications';
import { shortenAddress } from '../../../../helpers/utils/util';
import {
  createTextItems,
  formatIsoDateString,
  getNetworkDetailsByChainId,
} from '../../../../helpers/utils/notification.util';
import {
  TextVariant,
  BackgroundColor,
  TextColor,
} from '../../../../helpers/constants/design-system';

import {
  NotificationListItem,
  NotificationDetailAddress,
  NotificationDetailInfo,
  NotificationDetailAsset,
  NotificationDetailNetworkFee,
  NotificationDetailBlockExplorerButton,
  NotificationDetailTitle,
  NotificationDetailCollection,
  NotificationDetailNft,
} from '../../../../components/multichain';
import { NotificationListItemIconType } from '../../../../components/multichain/notification-list-item-icon/notification-list-item-icon';
import {
  BadgeWrapperPosition,
  IconName,
} from '../../../../components/component-library';

const { TRIGGER_TYPES } = NotificationServicesController.Constants;

type ERC721Notification = ExtractedNotification<
  | NotificationServicesController.Constants.TRIGGER_TYPES.ERC721_RECEIVED
  | NotificationServicesController.Constants.TRIGGER_TYPES.ERC721_SENT
>;
const isERC721Notification = isOfTypeNodeGuard([
  TRIGGER_TYPES.ERC721_RECEIVED,
  TRIGGER_TYPES.ERC721_SENT,
]);

const isSent = (n: ERC721Notification) =>
  n.type === TRIGGER_TYPES.ERC721_SENT;
const title = (n: ERC721Notification, t: any) =>
  isSent(n)
    ? t('notificationItemNFTSentTo')
    : t('notificationItemNFTReceivedFrom');

const getTitle = (n: ERC721Notification, t: any) => {
  const address = shortenAddress(isSent(n) ? n.data.to : n.data.from);
  // TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31880
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const items = createTextItems([title(n, t) || '', address], TextVariant.bodySm);
  return items;
};

const getDescription = (n: ERC721Notification) => {
  const items = createTextItems(
    // TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31880
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    [n.data.nft?.collection.name || ''],
    TextVariant.bodyMd,
  );
  return items;
};

export const components: NotificationComponent<ERC721Notification> = {
  guardFn: isERC721Notification,
  item: ({ notification, onClick }) => {
    const t = useI18nContext();
    return (
      <NotificationListItem
        id={notification.id}
        isRead={notification.isRead}
        icon={{
          type: notification.data.nft?.image
            ? NotificationListItemIconType.Nft
            : NotificationListItemIconType.Token,
          // TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31880
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          value: notification.data.nft?.image || 'http://foo.com/bar.png',
          badge: {
            icon: isSent(notification)
              ? IconName.Arrow2UpRight
              : IconName.Received,
            position: BadgeWrapperPosition.bottomRight,
          },
        }}
        title={getTitle(notification, t)}
        description={getDescription(notification)}
        createdAt={new Date(notification.createdAt)}
        // TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31880
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        amount={notification.data.nft?.token_id || ''}
        onClick={onClick}
      />
    );
  },
  details: {
    title: ({ notification }) => {
      const t = useI18nContext();
      return (
        <NotificationDetailTitle
          title={`${
            isSent(notification)
              ? t('notificationItemSent')
              : t('notificationItemReceived')
          } NFT`}
          date={formatIsoDateString(notification.createdAt)}
        />
      );
    },
    body: {
      type: NotificationComponentType.OnChainBody,
      Image: ({ notification }) => {
        const { nativeCurrencyLogo, nativeCurrencyName } =
          getNetworkDetailsByChainId(notification.chain_id);
        return (
          <NotificationDetailNft
            networkSrc={nativeCurrencyLogo}
            // TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31880
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            tokenId={notification.data.nft?.token_id || ''}
            // TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31880
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            tokenName={notification.data.nft?.name || ''}
            // TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31880
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            tokenSrc={notification.data.nft?.image || ''}
            networkName={nativeCurrencyName}
          />
        );
      },
      From: ({ notification }) => {
        const t = useI18nContext();
        return (
          <NotificationDetailAddress
            side={`${t('notificationItemFrom')}${
              isSent(notification) ? ` (${t('you')})` : ''
            }`}
            address={notification.data.from}
          />
        );
      },
      To: ({ notification }) => {
        const t = useI18nContext();
        return (
          <NotificationDetailAddress
            side={`${t('notificationItemTo')}${
              isSent(notification) ? '' : ` (${t('you')})`
            }`}
            address={notification.data.to}
          />
        );
      },
      Status: () => {
        const t = useI18nContext();
        return (
          <NotificationDetailInfo
            icon={{
              iconName: IconName.Check,
              color: TextColor.successDefault,
              backgroundColor: BackgroundColor.successMuted,
            }}
            // TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31880
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            label={t('notificationItemStatus') || ''}
            // TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31880
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            detail={t('notificationItemConfirmed') || ''}
          />
        );
      },
      Asset: ({ notification }) => {
        const t = useI18nContext();
        const { nativeCurrencyLogo } = getNetworkDetailsByChainId(
          notification.chain_id,
        );
        return (
          <NotificationDetailCollection
            icon={{
              // TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31880
              // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
              src: notification.data.nft?.image || '',
              badgeSrc: nativeCurrencyLogo,
            }}
            // TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31880
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            label={t('notificationItemCollection') || ''}
            collection={`${notification.data.nft?.collection.name} (${notification.data.nft?.token_id})`}
          />
        );
      },
      Network: ({ notification }) => {
        const t = useI18nContext();
        const { nativeCurrencyLogo, nativeCurrencyName } =
          getNetworkDetailsByChainId(notification.chain_id);

        return (
          <NotificationDetailAsset
            icon={{
              src: nativeCurrencyLogo,
            }}
            // TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31880
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            label={t('notificationDetailNetwork') || ''}
            detail={nativeCurrencyName}
          />
        );
      },
      NetworkFee: ({ notification }) => {
        return <NotificationDetailNetworkFee notification={notification} />;
      },
    },
  },
  footer: {
    type: NotificationComponentType.OnChainFooter,
    ScanLink: ({ notification }) => {
      return (
        <NotificationDetailBlockExplorerButton
          notification={notification}
          chainId={notification.chain_id}
          txHash={notification.tx_hash}
        />
      );
    },
  },
};
