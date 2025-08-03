import React, { useState } from 'react';
import { Box } from '../../component-library';
import { Tab, Tabs } from '../../ui/tabs';
import { useI18nContext } from '../../../hooks/useI18nContext';
import TransactionList from './transaction-list.component';
import { ReceiveTransactionList } from './receive-transaction-list';

interface ActivityTabsProps {
  boxProps?: any;
}

export const ActivityTabs: React.FC<ActivityTabsProps> = ({ boxProps }) => {
  const [activeTab, setActiveTab] = useState<'send' | 'receive'>('send');
  const t = useI18nContext();

  const tabProps = {
    activeClassName: 'activity-tabs__tab--active',
    className: 'activity-tabs__tab',
  };

  const handleTabClick = (tabKey: string) => {
    setActiveTab(tabKey as 'send' | 'receive');
  };

  return (
    <Box {...boxProps}>
      <Tabs
        defaultActiveTabKey={activeTab}
        onTabClick={handleTabClick}
        tabsClassName="activity-tabs activity-receive-tabs"
      >
        <Tab
          name={t('send')}
          tabKey="send"
          data-testid="activity-tabs__send-tab"
          {...tabProps}
        >
          <TransactionList
            boxProps={{ paddingTop: 3 }}
            hideTokenTransactions={false}
          />
        </Tab>
        <Tab
          name={t('receive')}
          tabKey="receive"
          data-testid="activity-tabs__receive-tab"
          {...tabProps}
        >
          <ReceiveTransactionList
            boxProps={{ paddingTop: 3 }}
          />
        </Tab>
      </Tabs>
    </Box>
  );
};
