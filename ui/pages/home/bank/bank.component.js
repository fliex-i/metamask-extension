import React, { useState, useEffect } from 'react';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { useSelector } from 'react-redux';
import { getCurrentLocale } from '../../../ducks/locale/locale';

const TipsBank = () => {
  const t = useI18nContext();
  const [visible, setVisible] = useState(true);
  const currentLocale = useSelector(getCurrentLocale);
  useEffect(() => {
    const closed = window.localStorage?.getItem('tipsBankClosed');
    if (closed === 'true') {
      setVisible(false);
    }
  }, []);

  const handleClose = () => {
    setVisible(false);
    window.localStorage?.setItem('tipsBankClosed', 'true');
  };

  if (!visible) {
    return null;
  }

  return (
    <div
      className="tips-bank-content"
      style={{ position: 'relative', display: visible ? '' : 'none' }}
    >
      <div className="tips-bank-ico">
        <img src="./images/home/tips.svg" width={20} height={20} />
        <div className="tips-bank-text">
          {t('tipsBank')}
          <span
            onClick={() => {
              const url =
                currentLocale === 'ja'
                  ? 'https://jdb.techpulse.pro/ja'
                  : 'https://jdb.techpulse.pro/';
              window.open(url, '_blank');
            }}
            className="tips-bank-start"
          >
            {t('startNow')}
          </span>
        </div>
      </div>

      <img
        src="./images/home/close.svg"
        width={20}
        height={20}
        className="close"
        onClick={handleClose}
      />
    </div>
  );
};

export default TipsBank;
