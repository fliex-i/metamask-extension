import React, { useState, useEffect } from 'react';
import { useI18nContext } from '../../../hooks/useI18nContext';
const TipsBank = () => {
  const t = useI18nContext();

  return (
    <div className="tips-bank-content" style={{ position: 'relative' }}>
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
