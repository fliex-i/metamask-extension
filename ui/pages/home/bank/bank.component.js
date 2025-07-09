import React, { useState, useEffect } from 'react';

import { useI18nContext } from '../../../hooks/useI18nContext';

const TipsBank = () => {
  const t = useI18nContext();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const closed = localStorage.getItem('tipsBankClosed');
    if (closed === 'true') {
      setVisible(false);
    }
  }, []);

  const handleClose = () => {
    setVisible(false);
    localStorage.setItem('tipsBankClosed', 'true');
  };

  if (!visible) return null;

  return (
    <div className="tips-bank-content" style={{ position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          top: '-10px',
          right: 0,
          cursor: 'pointer',
          fontSize: 24,
          lineHeight: 1,
        }}
        onClick={handleClose}
        aria-label="close"
        title={t('close') || 'Close'}
      >
        ×
      </div>
      <div className="tips-bank-ico">
        <img src="./images/home/tips.svg" width={20} height={20} />
        <div>{t('tipsBank')}</div>
      </div>
      <div className="tips-bank-des">
        <div
          onClick={() => {
            window.open('https://dapp.jdbbanktest.xyz/login/', '_blank');
          }}
          className="tips-bank-start"
        >
          {t('startNow')}
        </div>
      </div>
    </div>
  );
};

export default TipsBank;
