import React, { useState, useEffect } from 'react';

import { useI18nContext } from '../../../hooks/useI18nContext';

const TipsHome = () => {
  const t = useI18nContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth > 768);
    };

    // Check on mount
    checkScreenSize();

    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="tips-home-content">
      <div className="tips-home-ico">
        <img src="./images/home/alert.svg" width={20} height={20} />
      </div>
      <div className="tips-home-des" style={{ position: 'relative', flex: 1 }}>
        <div
          style={{ marginBottom: '4px', fontSize: isDesktop ? '16px' : '14px' }}
        >
          {isDesktop ? (
            t('tipsHome')
          ) : (
            <>
              {t('tipsHomes')}
              <br />
              {t('tipsHomes1')}
            </>
          )}
        </div>
        {isExpanded && (
          <>
            <div style={{ marginBottom: '4px' }}>{t('tipsHome1')}</div>
            <div style={{ marginBottom: '4px' }}>{t('tipsHome2')}</div>
          </>
        )}
        <button
          onClick={toggleExpand}
          type="button"
          style={{
            position: 'absolute',
            right: '-10px',
            top: '-3px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            width: '24px',
            height: '24px',
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
              color: '#B771E5',
            }}
          >
            <polyline points="6,9 12,15 18,9"></polyline>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TipsHome;
