import React, { useContext, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { I18nContext } from '../../../../../contexts/i18n';
import {
  ButtonPrimary,
  ButtonPrimarySize,
  ButtonSecondary,
  ButtonSecondarySize,
  Box,
  Modal,
  ModalContent,
  ModalOverlay,
  Text,
} from '../../../../component-library';
import { addTransactionAndRouteToConfirmationPage } from '../../../../../store/actions';
import {
  getSelectedAccount,
  getSelectedNetworkClientId,
} from '../../../../../selectors';
import { TextVariant } from '../../../../../helpers/constants/design-system';
import { ethers } from 'ethers';

export const TokenApprovalModal = ({
  isOpen,
  onClose,
  onApprovalComplete,
  tokenAddress,
  tokenSymbol,
  amount,
  spenderAddress,
}) => {
  const t = useContext(I18nContext);
  const dispatch = useDispatch();
  const [isApproving, setIsApproving] = useState(false);
  const [error, setError] = useState(null);

  const selectedAccount = useSelector(getSelectedAccount);
  const networkClientId = useSelector(getSelectedNetworkClientId);
  const draftTransaction = useSelector(
    (state) => state.send.draftTransactions[state.send.currentTransactionUUID],
  );

  const handleApprove = async () => {
    setIsApproving(true);
    setError(null);

    try {
      const approveAbi = {
        inputs: [
          { internalType: 'address', name: '_spender', type: 'address' },
          { internalType: 'uint256', name: '_value', type: 'uint256' },
        ],
        name: 'approve',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'nonpayable',
        type: 'function',
      };

      const iface = new ethers.utils.Interface([approveAbi]);
      const callData = iface.encodeFunctionData('approve', [
        spenderAddress,
        (amount =
          '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'),
      ]);

      if (!selectedAccount) {
        throw new Error('No selected account found');
      }

      const approvalTransaction = {
        to: tokenAddress,
        value: '0x0',
        data: callData,
        from: selectedAccount.address,
        gas: ethers.BigNumber.from(8e4).toHexString(),
      };

      await dispatch(
        addTransactionAndRouteToConfirmationPage(approvalTransaction, {
          networkClientId,
        }),
      );

      onApprovalComplete();
      onClose();
    } catch (err) {
      console.error('授权失败:', err);
      setError(err.message || '授权失败，请重试');
    } finally {
      setIsApproving(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <Box padding={4}>
          <Text variant={TextVariant.headingMd} marginBottom={3}>
            {t('tokenApprovalRequired')}
          </Text>

          <Text variant={TextVariant.bodyMd} marginBottom={4}>
            {t('tokenApprovalDescription', [
              tokenSymbol,
              amount,
              spenderAddress,
            ])}
          </Text>

          {error && (
            <Box
              backgroundColor="error.muted"
              padding={3}
              borderRadius="md"
              marginBottom={4}
            >
              <Text variant={TextVariant.bodySm} color="error.default">
                {error}
              </Text>
            </Box>
          )}

          <Box display="flex" gap={3}>
            <ButtonSecondary
              onClick={handleCancel}
              size={ButtonSecondarySize.Lg}
              disabled={isApproving}
              block
            >
              {t('cancel')}
            </ButtonSecondary>

            <ButtonPrimary
              onClick={handleApprove}
              size={ButtonPrimarySize.Lg}
              loading={isApproving}
              disabled={isApproving}
              block
            >
              {t('approve')}
            </ButtonPrimary>
          </Box>
        </Box>
      </ModalContent>
    </Modal>
  );
};
