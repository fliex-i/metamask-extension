import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
  Box,
  Text,
  Modal,
  ModalOverlay,
} from '../../components/component-library';
import { ModalContent } from '../../components/component-library/modal-content/deprecated';
import { ModalHeader } from '../../components/component-library/modal-header';
import {
  setCurrentCurrency,
  lockMetamask,
  updateCurrentLocale,
  setCompletedOnboarding,
} from '../../store/actions';
import AutoLockModal from '../../components/auto-lock-modal/auto-lock-modal';
import availableCurrencies from '../../helpers/constants/available-conversions.json';
import availableCurrenciesJp from '../../helpers/constants/available-conversions-jp.json';
import SelectionModal from '../../components/ui/selection-modal';
import {
  DEFAULT_ROUTE,
  RESTORE_VAULT_ROUTE,
  CONTACT_LIST_ROUTE,
  IMPORT_SRP_ROUTE,
  IMPORT_SRP_SETTINGS_ROUTE,
} from '../../helpers/constants/routes';
import { getCurrentLocale } from '../../ducks/locale/locale';
// eslint-disable-next-line import/no-restricted-paths
import locales from '../../../app/_locales/index.json';
import { useI18nContext } from '../../hooks/useI18nContext';
import { MetaMetricsContext } from '../../contexts/metametrics';
import {
  MetaMetricsEventCategory,
  MetaMetricsEventName,
  MetaMetricsEventAccountType,
} from '../../../shared/constants/metametrics';
import { getHDEntropyIndex } from '../../selectors/selectors';
import {
  Display,
  FlexDirection,
  TextVariant,
} from '../../helpers/constants/design-system';
import { ImportAccount } from '../../components/multichain/import-account';
import { getCurrentCurrency } from '../../ducks/metamask/metamask';

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
  const trackEvent = useContext(MetaMetricsContext);
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
      if (currentLocale === 'ja' && code === 'jpy') {
        return {
          name: '日本円',
          value: code,
        };
      }
      return {
        name: `${code.toUpperCase()}`,
        value: code,
      };
    });
  }, [sortedCurrencies, currentLocale]);
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
  const [isOpen, setIsOpen] = useState(false);
  const [isAutoLockModalOpen, setIsAutoLockModalOpen] = useState(false);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
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

  const tabs: TabItem[] = useMemo(
    () => [
      {
        label: null,
        items: [
          {
            name: t('back'),
            icon: './images/back.png',
            onClick: () => {
              history.push(DEFAULT_ROUTE);
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
          //   link: 'https://test.crypto-bridge.co/login/',
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
          {
            name: t('importPrivateKey'),
            icon: './images/setting/protection.svg',
            onClick: () => setIsOpen(true),
          },
          {
            name: t('importSrp'),
            icon: './images/setting/protection.svg',
            onClick: () => {
              history.push(IMPORT_SRP_SETTINGS_ROUTE);
            },
          },
        ],
      },
      {
        label: t('resources'),
        items: [
          {
            name: t('customerSupport'),
            icon: './images/setting/customer.svg',
            link:
              currentLocale === 'ja'
                ? 'https://www.crypto-bridge.co/jp/#support'
                : 'https://www.crypto-bridge.co/#support',
          },
          // {
          //   name: t('submitFeedback'),
          //   icon: './images/setting/exit.svg',
          //   link: 'https://www.crypto-bridge.co/jp/#support',
          // },
          {
            name: t('termC'),
            icon: './images/setting/terms.svg',
            link:
              currentLocale === 'ja'
                ? 'https://www.crypto-bridge.co/wp-content/uploads/2025/07/CryptoBridge_%E5%88%A9%E7%94%A8%E8%A6%8F%E7%B4%84_JP.pdf'
                : 'https://www.crypto-bridge.co/wp-content/uploads/2025/07/CryptoBridge_Terms_and_Conditions_EN.pdf',
          },
          {
            name: t('privacyPolicy'),
            icon: './images/setting/list.svg',
            link:
              currentLocale === 'ja'
                ? 'https://www.crypto-bridge.co/wp-content/uploads/2025/07/CryptoBridge_%E3%83%95%E3%82%9A%E3%83%A9%E3%82%A4%E3%83%8F%E3%82%99%E3%82%B7%E3%83%BC%E3%83%9B%E3%82%9A%E3%83%AA%E3%82%B7%E3%83%BC_JP.pdf'
                : 'https://www.crypto-bridge.co/wp-content/uploads/2025/07/CryptoBridge_Privacy_Policy_EN.pdf',
          }
          // ,
          // {
          //   name: t('userManual'),
          //   icon: './images/setting/book.svg',
          //   link: 'https://www.crypto-bridge.co/wp-content/uploads/2025/06/FAQ-JP-01.pdf',
          // },
          // {
          //   name: t('FAQ'),
          //   icon: './images/setting/faq.svg',
          //   link: 'https://www.crypto-bridge.co/wp-content/uploads/2025/06/FAQ-JP-01.pdf',
          // },
        ],
      },
    ],
    [currentLocale, t],
  );
  const updateCurrency = (newCurrency: string) => {
    dispatch(setCurrentCurrency(newCurrency));
  };

  return (
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
                    onClick={(e: any) => {
                      if (item.currency) {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsCurrencyModalOpen(true);
                      } else if (item.isLanguage) {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsLanguageModalOpen(true);
                      } else if (item.onClick) {
                        item.onClick();
                      }
                    }}
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
                            <Box style={{ cursor: 'pointer' }}>
                              <Text variant={TextVariant.bodyMd}>
                                {currencyOptions.find(
                                  (option) => option.value === currentCurrency,
                                )?.name || currentCurrency}
                              </Text>
                            </Box>
                          )}
                          {item.isLanguage && (
                            <Box style={{ cursor: 'pointer' }}>
                              <Text variant={TextVariant.bodyMd}>
                                {localeOptions.find(
                                  (option) => option.value === currentLocale,
                                )?.name || currentLocale}
                              </Text>
                            </Box>
                          )}
                        </Box>
                        <Box
                          as="img"
                          src="./images/setting/arrow-right.svg"
                          alt="arrow"
                        />
                      </>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ModalOverlay />
        <ModalContent
          className="multichain-account-menu-popover"
          modalDialogProps={{
            className: 'multichain-account-menu-popover__dialog',
            padding: 0,
            display: Display.Flex,
            flexDirection: FlexDirection.Column,
          }}
        >
          <ModalHeader
            padding={4}
            onClose={() => setIsOpen(false)}
            onBack={() => setIsOpen(false)}
          >
            {t('importPrivateKey')}
          </ModalHeader>
          <Box
            paddingLeft={4}
            paddingRight={4}
            paddingBottom={4}
            paddingTop={0}
          >
            <ImportAccount onActionComplete={onActionComplete} />
          </Box>
        </ModalContent>
      </Modal>

      <AutoLockModal
        isOpen={isAutoLockModalOpen}
        onClose={() => setIsAutoLockModalOpen(false)}
      />

      <SelectionModal
        isOpen={isCurrencyModalOpen}
        onClose={() => setIsCurrencyModalOpen(false)}
        title={t('defaultCurrency')}
        options={currencyOptions}
        selectedOption={currentCurrency || ''}
        onSelect={async (newCurrency) => {
          await updateCurrency(newCurrency);
          setIsCurrencyModalOpen(false);
        }}
        onCancel={() => {
          // 取消时不需要做任何操作，状态会自动重置
        }}
        data-testid="currency-select-modal"
      />

      <SelectionModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
        title={t('language')}
        options={localeOptions}
        selectedOption={currentLocale || ''}
        onSelect={async (newLocale) => {
          await updateLocale(newLocale);
          // 确保语言更新完成后再关闭模态框
          setIsLanguageModalOpen(false);
        }}
        onCancel={() => {
          // 取消时不需要做任何操作，状态会自动重置
        }}
        data-testid="locale-select-modal"
      />
    </>
  );
};

export default SettingsPage;
