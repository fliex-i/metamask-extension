import React from 'react';
import { useHistory } from 'react-router-dom';
import { AppHeader } from '../../components/multichain/app-header/app-header-full-screen';
import { DEFAULT_ROUTE, SETTINGS_ROUTE } from '../../helpers/constants/routes';
import { useI18nContext } from '../../hooks/useI18nContext';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const t = useI18nContext();
  const history = useHistory();
  console.log(history, '/history');
  const HandlerMenuClick = (route: string) => {
    history.push(route);
  };
  return (
    <div className="layout">
      <header className="layout__header">
        <div className="layout__header--left">
          <img
            src="./images/cryptobridge/logo.svg"
            alt="Logo"
            className="layout__header--left--logo"
          />
          <img
            src="./images/cryptobridge/Lucide-Icon.svg"
            alt="Icon"
            className="layout__header--left--icon"
          />
        </div>
        <div className="layout__header--right">
          <AppHeader location={history.location} />
        </div>
      </header>
      <div className="layout__content">
        <div className="layout__content--sidebar">
          <ul>
            <li onClick={() => HandlerMenuClick(DEFAULT_ROUTE)}>
              <img src="./images/cryptobridge/wallet.svg" alt="Wallet" />
              <span>{t('wallet')}</span>
            </li>
            <li onClick={() => HandlerMenuClick(SETTINGS_ROUTE)}>
              <img src="./images/cryptobridge/setting.svg" alt="Setting" />
              <span>{t('settings')}</span>
            </li>
          </ul>
        </div>
        <main className="layout__content--main">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
