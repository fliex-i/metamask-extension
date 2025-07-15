import React, { useState, useEffect } from 'react';
import { useI18nContext } from '../../../hooks/useI18nContext';

const TipsBank = () => {
  const t = useI18nContext();
  const [visible, setVisible] = useState(true);

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
        <div>{t('tipsBank')}</div>
      </div>
      <div className="tips-bank-des">
        <div
          onClick={() => {
            window.open('https://jdb.techpulse.pro/', '_blank');
          }}
          className="tips-bank-start"
        >
          {t('startNow')}
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
