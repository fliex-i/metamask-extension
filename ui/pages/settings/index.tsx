import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
<<<<<<< HEAD
import { Box, Text } from '../../components/component-library';
=======
import {
  Box,
  Text,
  Modal,
  ModalOverlay,
} from '../../components/component-library';
import { ModalContent } from '../../components/component-library/modal-content/deprecated';
import { ModalHeader } from '../../components/component-library/modal-header';
>>>>>>> e14fa689de (feat: update ui)
import {
  setCurrentCurrency,
  lockMetamask,
  updateCurrentLocale,
} from '../../store/actions';
import AutoLockModal from '../../components/auto-lock-modal/auto-lock-modal';
import availableCurrencies from '../../helpers/constants/available-conversions.json';
import availableCurrenciesJp from '../../helpers/constants/available-conversions-jp.json';
import Dropdown from '../../components/ui/dropdown';
import {
  DEFAULT_ROUTE,
  RESTORE_VAULT_ROUTE,
  CONTACT_LIST_ROUTE,
} from '../../helpers/constants/routes';
import { getCurrentLocale } from '../../ducks/locale/locale';
// eslint-disable-next-line import/no-restricted-paths
import locales from '../../../app/_locales/index.json';
import { useI18nContext } from '../../hooks/useI18nContext';
<<<<<<< HEAD
=======
import { MetaMetricsContext } from '../../contexts/metametrics';
import {
  MetaMetricsEventCategory,
  MetaMetricsEventName,
  MetaMetricsEventAccountType,
} from '../../../shared/constants/metametrics';
import { getHDEntropyIndex } from '../../selectors/selectors';
import { Display, FlexDirection } from '../../helpers/constants/design-system';
import { ImportAccount } from '../../components/multichain/import-account';
import { getCurrentCurrency } from '../../ducks/metamask/metamask';
>>>>>>> e14fa689de (feat: update ui)

type Item = {
  name: string | null;
  icon: string;
  link?: string;
  onClick?: () => void;
  isLanguage?: boolean;
  currency?: boolean;
  dontNeedRightIcon?: boolean;
};
type TabItem = {
  label: string | null;
  items: Item[];
};

const SettingsPage: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
<<<<<<< HEAD

  const sortedCurrencies = availableCurrencies.sort((a, b) => {
    return a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase());
  });

  const currencyOptions = sortedCurrencies.map(({ code, name }) => {
    return {
      name: `${code.toUpperCase()}`,
      value: code,
    };
  });

=======
  const trackEvent = useContext(MetaMetricsContext);
>>>>>>> e14fa689de (feat: update ui)
  const currentLocale = useSelector(getCurrentLocale);

  useEffect(() => {}, [currentLocale]);
  const sortedCurrencies = useMemo(() => {
    return currentLocale === 'ja'
      ? availableCurrenciesJp
      : availableCurrencies.sort((a, b) => {
          return a.name
            .toLocaleLowerCase()
            .localeCompare(b.name.toLocaleLowerCase());
        });
  }, [currentLocale]);

  const currencyOptions = useMemo(() => {
    return sortedCurrencies.map(({ code, name }) => {
      return {
        name: `${code.toUpperCase()}`,
        value: code,
      };
    });
  }, [sortedCurrencies]);
  const localeOptions = locales.map((locale: { [key: string]: string }) => {
    return {
      name: `${locale.name}`,
      value: locale.code,
    };
  });
  const t = useI18nContext();
  const updateLocale = async (newLocale: string) => {
    try {
      await dispatch(updateCurrentLocale(newLocale));
    } catch (error) {
      console.error('Error updating locale:', error);
    }
  };
<<<<<<< HEAD
=======
  const [isOpen, setIsOpen] = useState(false);
  const [isAutoLockModalOpen, setIsAutoLockModalOpen] = useState(false);
  const hdEntropyIndex = useSelector(getHDEntropyIndex);

  const currentCurrency = useSelector(getCurrentCurrency);

  const onActionComplete = useCallback(async (confirmed: boolean) => {
    if (confirmed) {
      trackEvent({
        category: MetaMetricsEventCategory.Navigation,
        event: MetaMetricsEventName.AccountAddSelected,
        properties: {
          account_type: MetaMetricsEventAccountType.Imported,
          location: 'Main Menu',
          hd_entropy_index: hdEntropyIndex,
        },
      });
      dispatch(setCompletedOnboarding());
      history.push(DEFAULT_ROUTE);
    }
    setIsOpen(false);
  }, []);
>>>>>>> e14fa689de (feat: update ui)

  const tabs: TabItem[] = useMemo(
    () => [
      {
        label: null,
        items: [
          {
            name: t('back'),
            icon: './images/back.png',
            onClick: () => {
              history.go(-1);
            },
            dontNeedRightIcon: true,
          },
        ],
      },
      {
        label: null,
        items: [
          {
            name: t('lockNow'),
            icon: './images/setting/locknow.svg',
            onClick: () => {
              dispatch(lockMetamask());
              history.push(DEFAULT_ROUTE);
            },
          },
          // {
          //   name: t('blankAccount'),
          //   icon: './images/setting/bankAccount.svg',
          //   link: 'https://dapp.jdbbanktest.xyz/login/',
          // },
          {
            name: t('addressBook'),
            icon: './images/setting/addressBook.svg',
            onClick: () => {
              history.push(CONTACT_LIST_ROUTE);
            },
          },
        ],
      },
      {
        label: t('preferences'),
        items: [
          {
            name: t('defaultCurrency'),
            icon: './images/setting/currency.svg',
            currency: true,
          },
          {
            name: t('language'),
            icon: './images/setting/locale.svg',
            isLanguage: true,
          },
        ],
      },
      {
        label: t('security'),
        items: [
          {
            name: t('autoLock'),
            icon: './images/setting/auto-lock.svg',
            onClick: () => setIsAutoLockModalOpen(true),
          },
          {
            name: t('changePassword'),
            icon: './images/setting/password.svg',
            onClick: () => {
              history.push(RESTORE_VAULT_ROUTE);
              // dispatch(markPasswordForgotten());
            },
          },
          // {
          //   name: t('protection'),
          //   icon: './images/setting/protection.svg',
          //   link: '',
          // },
        ],
      },
      {
        label: t('resources'),
        items: [
          {
            name: t('customerSupport'),
            icon: './images/setting/customer.svg',
            link: 'https://www.crypto-bridge.co/jp/#support',
          },
          {
            name: t('submitFeedback'),
            icon: './images/setting/exit.svg',
            link: 'https://www.crypto-bridge.co/jp/#support',
          },
          {
            name: t('termC'),
            icon: './images/setting/terms.svg',
            link: 'https://www.crypto-bridge.co/wp-content/uploads/2025/06/EN_JP-CryptoBridge-Privacy-Policy-2025-06-12-1.pdf',
          },
          {
            name: t('privacyPolicy'),
            icon: './images/setting/list.svg',
            link: 'https://www.crypto-bridge.co/wp-content/uploads/2025/06/privacy.pdf',
          },
          {
            name: t('userManual'),
            icon: './images/setting/book.svg',
            link: 'https://www.crypto-bridge.co/wp-content/uploads/2025/06/FAQ-JP-01.pdf',
          },
          {
            name: t('FAQ'),
            icon: './images/setting/faq.svg',
            link: 'https://www.crypto-bridge.co/wp-content/uploads/2025/06/FAQ-JP-01.pdf',
          },
        ],
      },
    ],
    [currentLocale, t],
  );
  const updateCurrency = (newCurrency: string) => {
    dispatch(setCurrentCurrency(newCurrency));
  };

  return (
<<<<<<< HEAD
    <Box className="settings-page">
      <Box className="settings-page__tabs">
        {tabs.map((tab, index) => (
          <Box key={index} className="settings-page__tabs__tab">
            {tab.label && (
              <Text className="settings-page__tabs__tab__label">
                {tab.label &&
                  tab.label.charAt(0).toUpperCase() + tab.label.slice(1)}
              </Text>
            )}
            <Box className="settings-page__tabs__tab__items">
              {tab.items.map((item, _key) => (
                <Box
                  key={_key}
                  className="settings-page__tabs__tab__items-item"
                  onClick={item.onClick ? () => item.onClick?.() : undefined}
                >
                  {item.link ? (
                    <Box
                      as="a"
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Box as="img" src={item.icon} alt={''} />
                      {item.name && (
                        <Box className="settings-page__tabs__tab__items-item__center">
                          <Text as="span">{item.name}</Text>
                        </Box>
                      )}
                      <Box
                        as="img"
                        src="./images/setting/arrow-right.svg"
                        alt="arrow"
                      />
                    </Box>
                  ) : (
                    <>
                      <Box
                        as="img"
                        src={item.icon}
                        alt={''}
                        className="settings-page__tabs__tab__items-item--icon"
                      />
                      <Box className="settings-page__tabs__tab__items-item__center">
                        {item.name && (
                          <Text
                            as="span"
                            className={
                              item.dontNeedRightIcon ? 'addWeight' : ''
                            }
                          >
                            {item.name}
                          </Text>
                        )}
                        {item.currency && (
                          <Dropdown
                            data-testid="currency-select"
                            options={currencyOptions}
                            selectedOption={currency}
                            onChange={(newCurrency) => {
                              updateCurrency(newCurrency);
                            }}
                            className="center__dropdown"
                          />
                        )}
                        {item.isLanguage && (
                          <Dropdown
                            data-testid="locale-select"
                            options={localeOptions}
                            className="center__dropdown"
                            selectedOption={currentLocale}
                            onChange={async (newLocale) =>
                              updateLocale(newLocale)
                            }
                          />
                        )}
                      </Box>
                      {item.currency === item.isLanguage &&
                        !item.dontNeedRightIcon && (
                          <Box
                            as="img"
                            src="./images/setting/arrow-right.svg"
                            alt="arrow"
                          />
                        )}
                    </>
                  )}
                </Box>
              ))}
=======
    <>
      <Box className="settings-page">
        <Box className="settings-page__tabs">
          {tabs.map((tab, index) => (
            <Box key={index} className="settings-page__tabs__tab">
              {tab.label && (
                <Text className="settings-page__tabs__tab__label">
                  {tab.label &&
                    tab.label.charAt(0).toUpperCase() + tab.label.slice(1)}
                </Text>
              )}
              <Box className="settings-page__tabs__tab__items">
                {tab.items.map((item, _key) => (
                  <Box
                    key={_key}
                    className="settings-page__tabs__tab__items-item"
                    onClick={item.onClick ? () => item.onClick?.() : undefined}
                  >
                    {item.link ? (
                      <Box
                        as="a"
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Box as="img" src={item.icon} alt={''} />
                        {item.name && (
                          <Box className="settings-page__tabs__tab__items-item__center">
                            <Text as="span">{item.name}</Text>
                          </Box>
                        )}
                        <Box
                          as="img"
                          src="./images/setting/arrow-right.svg"
                          alt="arrow"
                        />
                      </Box>
                    ) : (
                      <>
                        <Box
                          as="img"
                          src={item.icon}
                          alt={''}
                          className="settings-page__tabs__tab__items-item--icon"
                        />
                        <Box className="settings-page__tabs__tab__items-item__center">
                          {item.name && (
                            <Text
                              as="span"
                              className={
                                item.dontNeedRightIcon ? 'addWeight' : ''
                              }
                            >
                              {item.name}
                            </Text>
                          )}
                          {item.currency && (
                            <Dropdown
                              data-testid="currency-select"
                              options={currencyOptions}
                              selectedOption={currentCurrency}
                              onChange={(newCurrency) => {
                                if (newCurrency === '日本円') {
                                  updateCurrency('jpy');
                                } else {
                                  updateCurrency(newCurrency);
                                }
                              }}
                              className="center__dropdown"
                            />
                          )}
                          {item.isLanguage && (
                            <Dropdown
                              data-testid="locale-select"
                              options={localeOptions}
                              className="center__dropdown"
                              selectedOption={currentLocale}
                              onChange={async (newLocale) =>
                                updateLocale(newLocale)
                              }
                            />
                          )}
                        </Box>
                        {!item.currency && !item.isLanguage &&
                          !item.dontNeedRightIcon && (
                            <Box
                              as="img"
                              src="./images/setting/arrow-right.svg"
                              alt="arrow"
                            />
                          )}
                      </>
                    )}
                  </Box>
                ))}
              </Box>
>>>>>>> e14fa689de (feat: update ui)
            </Box>
          </Box>
<<<<<<< HEAD
        ))}
      </Box>
    </Box>
=======
        </ModalContent>
      </Modal>

      <AutoLockModal
        isOpen={isAutoLockModalOpen}
        onClose={() => setIsAutoLockModalOpen(false)}
      />
    </>
>>>>>>> e14fa689de (feat: update ui)
  );
};

export default SettingsPage;
