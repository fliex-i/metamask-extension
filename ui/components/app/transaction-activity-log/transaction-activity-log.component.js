import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import { getBlockExplorerLink } from '@metamask/etherscan-link';
import { formatDate, getURLHostName } from '../../../helpers/utils/util';
import { MetaMetricsEventCategory } from '../../../../shared/constants/metametrics';
import { getValueFromWeiHex } from '../../../../shared/modules/conversion.utils';
import TransactionActivityLogIcon from './transaction-activity-log-icon';
import { CONFIRMED_STATUS } from './transaction-activity-log.constants';
import { getCurrentLocale } from '../../../ducks/locale/locale';
import { connect } from 'react-redux';
import { parseStandardTokenTransactionData } from '../../../../shared/modules/transaction.utils';
import BigNumber from 'bignumber.js';

class TransactionActivityLog extends PureComponent {
  static contextTypes = {
    t: PropTypes.func,
    trackEvent: PropTypes.func,
  };

  static propTypes = {
    activities: PropTypes.array,
    className: PropTypes.string,
    conversionRate: PropTypes.number,
    inlineRetryIndex: PropTypes.number,
    inlineCancelIndex: PropTypes.number,
    nativeCurrency: PropTypes.string,
    onCancel: PropTypes.func,
    onRetry: PropTypes.func,
    primaryTransaction: PropTypes.object,
    isEarliestNonce: PropTypes.bool,
    rpcPrefs: PropTypes.object,
    currentLocale: PropTypes.string,
    tokens: PropTypes.array,
  };

  handleActivityClick = (activity) => {
    const { rpcPrefs } = this.props;
    const etherscanUrl = getBlockExplorerLink(activity, rpcPrefs);

    this.context.trackEvent({
      category: MetaMetricsEventCategory.Transactions,
      event: 'Clicked Block Explorer Link',
      properties: {
        link_type: 'Transaction Block Explorer',
        action: 'Activity Details',
        block_explorer_domain: getURLHostName(etherscanUrl),
      },
    });

    global.platform.openTab({ url: etherscanUrl });
  };

  renderInlineRetry(index) {
    const { t } = this.context;
    const {
      inlineRetryIndex,
      primaryTransaction = {},
      onRetry,
      isEarliestNonce,
    } = this.props;
    const { status } = primaryTransaction;

    return isEarliestNonce &&
      status !== CONFIRMED_STATUS &&
      index === inlineRetryIndex ? (
      <div className="transaction-activity-log__action-link" onClick={onRetry}>
        {t('speedUpTransaction')}
      </div>
    ) : null;
  }

  renderInlineCancel(index) {
    const { t } = this.context;
    const {
      inlineCancelIndex,
      primaryTransaction = {},
      onCancel,
      isEarliestNonce,
    } = this.props;
    const { status } = primaryTransaction;

    return isEarliestNonce &&
      status !== CONFIRMED_STATUS &&
      index === inlineCancelIndex ? (
      <div className="transaction-activity-log__action-link" onClick={onCancel}>
        {t('speedUpCancellation')}
      </div>
    ) : null;
  }

  renderActivity(activity, index) {
    const { conversionRate, nativeCurrency, currentLocale, primaryTransaction, tokens } = this.props;
    const { eventKey, value, timestamp } = activity;

    let ethValue;

    // 只对transactionCreated事件进行特殊处理
    if (eventKey === 'transactionCreated') {
      // 获取实际的转账金额和币种
      let displayValue, displayCurrency;

      if (primaryTransaction?.txParams?.data && primaryTransaction.txParams.data.length > 10) {
        // 尝试解析代币交易
        try {
          const tokenData = parseStandardTokenTransactionData(primaryTransaction.txParams.data);
          if (tokenData && tokenData.name === 'transfer') {
            // 获取代币信息
            // allTokens的结构是 { chainId: { address: [tokens] } }
            const chainId = primaryTransaction.chainId || '1'; // 默认主网
            const accountAddress = primaryTransaction.txParams.from;
            const tokenAddress = primaryTransaction.txParams.to;

            const accountTokens = tokens?.[chainId]?.[accountAddress] || [];
            const token = accountTokens.find(t => t.address.toLowerCase() === tokenAddress.toLowerCase());

            if (token) {
              // 代币转账 - 使用实际的转账金额和代币信息
              let tokenValue;
              if (typeof tokenData.args[1] === 'object' && tokenData.args[1]._hex) {
                // BigNumber对象，使用_hex属性
                tokenValue = tokenData.args[1]._hex;
              } else if (typeof tokenData.args[1] === 'object') {
                // 其他对象类型，转换为字符串
                tokenValue = tokenData.args[1].toString();
              } else {
                // 字符串或数字
                tokenValue = tokenData.args[1];
              }

              // 直接使用BigNumber进行转换
              const weiValue = new BigNumber(tokenValue, 16); // 从十六进制转换
              const tokenValueDecimal = weiValue.dividedBy(new BigNumber(10).pow(token.decimals));
              displayValue = tokenValueDecimal.toFixed(token.decimals);

              // 移除小数点后的多余零
              displayValue = displayValue.replace(/\.?0+$/, '');
              displayCurrency = token.symbol;
            } else {
              // 代币信息未找到，使用通用TOKEN标识
              let tokenValue;
              if (typeof tokenData.args[1] === 'object' && tokenData.args[1]._hex) {
                // BigNumber对象，使用_hex属性
                tokenValue = tokenData.args[1]._hex;
              } else if (typeof tokenData.args[1] === 'object') {
                // 其他对象类型，转换为字符串
                tokenValue = tokenData.args[1].toString();
              } else {
                // 字符串或数字
                tokenValue = tokenData.args[1];
              }

              // 使用默认18位精度
              const weiValue = new BigNumber(tokenValue, 16);
              const tokenValueDecimal = weiValue.dividedBy(new BigNumber(10).pow(18));
              displayValue = tokenValueDecimal.toFixed(18);

              // 移除小数点后的多余零
              displayValue = displayValue.replace(/\.?0+$/, '');
              displayCurrency = 'TOKEN';
            }
          }
        } catch (error) {
          console.warn('Failed to parse token transaction data:', error);
        }
      }

      // 如果没有解析到代币信息，检查是否为原生币转账
      if (!displayValue && primaryTransaction?.txParams?.value) {
        const nativeValue = primaryTransaction.txParams.value;
        if (nativeValue && nativeValue !== '0x0' && nativeValue !== '0x') {
          displayValue = getValueFromWeiHex({
            value: nativeValue,
            fromCurrency: 'ETH',
            toCurrency: 'ETH',
            conversionRate,
            numberOfDecimals: 6,
          });
          displayCurrency = nativeCurrency;
        }
      }

      // 如果还是没有解析到，使用默认的gas fee显示
      if (!displayValue) {
        displayValue = getValueFromWeiHex({
          value,
          fromCurrency: 'ETH',
          toCurrency: 'ETH',
          conversionRate,
          numberOfDecimals: 6,
        });
        displayCurrency = nativeCurrency;
      }

      ethValue = `${displayValue} ${displayCurrency}`;
    } else {
      // 其他事件保持原来的显示方式
      ethValue = `${getValueFromWeiHex({
        value,
        fromCurrency: 'ETH',
        toCurrency: 'ETH',
        conversionRate,
        numberOfDecimals: 6,
      })} ${nativeCurrency}`;
    }

    // Format timestamp based on locale
    let formattedTimestamp;
    if (currentLocale === 'ja') {
      // Japanese format: "2025年8月3日 08:48"
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      formattedTimestamp = `${year}年${month}月${day}日 ${hours}:${minutes}`;
    } else {
      // Default English format
      formattedTimestamp = formatDate(timestamp, "T 'on' M/d/y");
    }

    const activityText = this.context.t(eventKey, [
      ethValue,
      formattedTimestamp,
    ]);

    return (
      <div key={index} className="transaction-activity-log__activity">
        <TransactionActivityLogIcon
          className="transaction-activity-log__activity-icon"
          eventKey={eventKey}
        />
        <div className="transaction-activity-log__entry-container">
          <div
            className="transaction-activity-log__activity-text"
            title={activityText}
            onClick={() => this.handleActivityClick(activity)}
          >
            {activityText}
          </div>
          {this.renderInlineRetry(index)}
          {this.renderInlineCancel(index)}
        </div>
      </div>
    );
  }

  render() {
    const { t } = this.context;
    const { className, activities } = this.props;

    if (activities.length === 0) {
      return null;
    }

    return (
      <div className={classnames('transaction-activity-log', className)}>
        <div className="transaction-activity-log__title">
          {t('activityLog')}
        </div>
        <div className="transaction-activity-log__activities-container">
          {activities.map((activity, index) =>
            this.renderActivity(activity, index),
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  currentLocale: getCurrentLocale(state),
  tokens: state.metamask.allTokens,
});

export default connect(mapStateToProps)(TransactionActivityLog);
