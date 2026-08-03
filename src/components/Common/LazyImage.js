import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useTheme } from '../../config/theme';

const LazyImage = ({
  source,
  style,
  resizeMode = 'cover',
  showLoader = true,
  fallback = true,
  ...props
}) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoadStart = () => {
    setLoading(true);
    setError(false);
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  return (
    <View style={[styles.container, style]}>
      {!error ? (
        <FastImage
          source={source}
          style={[styles.image, style]}
          resizeMode={resizeMode}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          {...props}
        />
      ) : fallback ? (
        <View style={[styles.fallback, style]}>
          <FastImage
            source={require('../../assets/images/placeholder.png')}
            style={[styles.image, style]}
            resizeMode="cover"
          />
        </View>
      ) : null}

      {loading && showLoader && (
        <View style={[styles.loader, style]}>
          <ActivityIndicator size="small" color="#25D366" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
});

export default LazyImage;
