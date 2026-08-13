import React, { useMemo } from 'react';
import { Platform } from 'react-native';
import { getBannerAdId } from '../../services/adsConfig';

const AdComponent = () => {
  if (Platform.OS === 'web') return null;

  // Chargement dynamique sécurisé
  const { BannerAd, BannerAdSize } = require('react-native-google-mobile-ads');
  
  const adUnitId = useMemo(() => getBannerAdId(), []);

  return (
    <BannerAd
      unitId={adUnitId}
      size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} // Taille adaptative (meilleur taux de clic)
      requestOptions={{ requestNonPersonalizedAdsOnly: false }}
    />
  );
};

export default React.memo(AdComponent);