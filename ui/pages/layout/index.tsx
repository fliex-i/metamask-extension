import React from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import cs from 'classnames';
import { AppHeader } from '../../components/multichain/app-header/app-header-full-screen';
import { DEFAULT_ROUTE, SETTINGS_ROUTE } from '../../helpers/constants/routes';
import { useI18nContext } from '../../hooks/useI18nContext';
import { ButtonIcon, IconName } from '../../components/component-library';
import { getIsUnlocked } from '../../ducks/metamask/metamask';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const t = useI18nContext();
  const history = useHistory();
  const isUnlocked = useSelector(getIsUnlocked);
  const HandlerMenuClick = (route: string) => {
    history.push(route);
  };
  const [collapsed, setCollapsed] = React.useState(false);
  return (
    <div className="layout">
      {isUnlocked && (
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
              onClick={() => setCollapsed(!collapsed)}
            />
          </div>
          <div className="layout__header--right">
            <AppHeader location={history.location} />
          </div>
        </header>
      )}
      <div className="layout__content">
        {isUnlocked && (
          <div className={cs('layout__content--sidebar', { collapsed })}>
            <ul>
              <li
                onClick={() => HandlerMenuClick(DEFAULT_ROUTE)}
                className={
                  history.location.pathname === SETTINGS_ROUTE ? '' : 'active'
                }
              >
                <ButtonIcon
                  iconName={IconName.Wallet}
                  ariaLabel={t('wallet')}
                  className={
                    history.location.pathname === SETTINGS_ROUTE ? '' : 'active'
                  }
                ></ButtonIcon>

                <span>{t('wallet')}</span>
              </li>
              <li
                onClick={() => HandlerMenuClick(SETTINGS_ROUTE)}
                className={
                  history.location.pathname === SETTINGS_ROUTE ? 'active' : ''
                }
              >
                <ButtonIcon
                  iconName={IconName.Setting}
                  ariaLabel={t('settings')}
                  className={
                    history.location.pathname === SETTINGS_ROUTE ? 'active' : ''
                  }
                ></ButtonIcon>

                <span>{t('settings')}</span>
              </li>
            </ul>
          </div>
        )}
        <main className="layout__content--main">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
