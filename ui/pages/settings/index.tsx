import React,{useMemo} from 'react';
import { t } from '../../../shared/lib/translate';
import { link } from '../../components/app/snaps/snap-ui-renderer/components/link';

interface Item {
  name: string | null;
  icon: string;
  link?: string;
}
interface TabItem {
  label: string | null;
  items: Item[];
}


const SettingsPage: React.FC = () => {

    const tabs: TabItem[] = useMemo(
    () => [
      {
        label: null,
        items:[{
        name: t('lockNow'),
        icon: './images/setting/locknow.svg',
      },
      {
        name: t('blankAccount'),
        icon: './images/setting/bankAccount.svg',
      },
      {
        name: t('addressBook'),
        icon: './images/setting/addressBook.svg',
      },]
      },
      {
        label: t('preferences'),
        items:[{
        name: t('defaultCurrency'),
        icon: './images/setting/currency.svg',
      },
      {
        name: t('language'),
        icon: './images/setting/locale.svg',
      },
      ]
      },
      {
        label:t('Security'),
        items:[
          {
            name:t('autoLock'),
            icon: './images/setting/auto-lock.svg',
          },
          {
            name:t('changePassword'),
            icon: './images/setting/password.svg',
            link:''
          },
          {
            name:t('protection'),
            icon: './images/setting/protection.svg',
            link:''
          }
        ]
      },
      {
        label:t('resources'),
        items:[
          {
            name:t('customerSupport'),
            icon: './images/setting/customer.svg',
            link:''
          },
          {
            name:t('submitFeedback'),
            icon: './images/setting/exit.svg',
            link: ''
          },
          {
            name:t('termC'),
            icon: './images/setting/terms.svg',
            link: ''
          },
          {
            name:t('privacyPolicy'),
            icon: './images/setting/list.svg',
            link: ''
          },
          {
            name:t('userManual'),
            icon: './images/setting/book.svg',
            link: ''
          },
          {
            name:t('FAQ'),
            icon: './images/setting/faq.svg',
            link: ''
          }
        ]
      }
    ],
    [],
  );

  return (
    <div className="settings-page">
      <div className="settings-tabs">
        {tabs.map((tab,index) => (
          <div key={index} className="settings-tab">
            {tab.label && <h2 className="settings-tab-label">{tab.label}</h2>}
            <ul className="settings-tab-items">
              {tab.items.map((item,_key) => (
                <li key={_key} className="settings-tab-item">
                  {item.link ? (
                    <a href={item.link} className="settings-item-name">
                      <img src={item.icon} alt={item.name || ''} />
                      {item.name}
                    </a>
                  ) : (
                    <span className="settings-item-name">
                      <img src={item.icon} alt={item.name || ''} />
                      {item.name}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsPage;
