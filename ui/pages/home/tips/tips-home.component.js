import React from 'react';

import { useI18nContext } from '../../../hooks/useI18nContext';

const TipsHome = () => {
  const t = useI18nContext();

  return (
    <div className="tips-home-content">
      <div className="tips-home-ico">
        <img src="./images/home/alert.svg" width={20} height={20} />
      </div>
      <div className="tips-home-des">
        <div>{t('tipsHome')}</div>
        <div>{t('tipsHome1')}</div>
        <div>{t('tipsHome2')}</div>
      </div>
    </div>
  );
};

export default TipsHome;
