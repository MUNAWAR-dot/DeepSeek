import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { WebView } from 'react-native-webview';
import { useTheme } from '../../config/theme';

const WebViewScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { url, title = 'ChatsApp' } = route.params || {};
  
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(url);
  const [error, setError] = useState(null);
  
  const webViewRef = useRef(null);

  const handleNavigationStateChange = (navState) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
    setCurrentUrl(navState.url);
    setError(null);
  };

  const handleLoadStart = () => {
    setLoading(true);
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleLoadProgress = ({ nativeEvent }) => {
    setProgress(nativeEvent.progress);
  };

  const handleError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    setError(nativeEvent);
    setLoading(false);
  };

  const handleGoBack = () => {
    webViewRef.current?.goBack();
  };

  const handleGoForward = () => {
    webViewRef.current?.goForward();
  };

  const handleReload = () => {
    webViewRef.current?.reload();
  };

  const handleShare = async () => {
    try {
      await Share.share({
        url: currentUrl,
        message: currentUrl,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleClose = () => {
    if (canGoBack) {
      handleGoBack();
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
          <Icon name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
            {title}
          </Text>
          <Text style={[styles.url, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            {currentUrl}
          </Text>
        </View>

        <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
          <Icon name="share-variant" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      {loading && (
        <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progress * 100}%`,
                backgroundColor: '#25D366',
              },
            ]}
          />
        </View>
      )}

      {/* Error State */}
      {error && (
        <View style={styles.errorContainer}>
          <Icon name="wifi-off" size={50} color={theme.colors.textSecondary} />
          <Text style={[styles.errorTitle, { color: theme.colors.text }]}>
            Unable to load page
          </Text>
          <Text style={[styles.errorMessage, { color: theme.colors.textSecondary }]}>
            Please check your internet connection
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleReload}>
            <Icon name="reload" size={20} color="#fff" />
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        style={styles.webview}
        onNavigationStateChange={handleNavigationStateChange}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onLoadProgress={handleLoadProgress}
        onError={handleError}
        startInLoadingState
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        cacheEnabled
      />

      {/* Bottom Navigation */}
      <View style={[styles.bottomBar, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity
          style={[styles.navButton, !canGoBack && styles.navButtonDisabled]}
          onPress={handleGoBack}
          disabled={!canGoBack}
        >
          <Icon
            name="chevron-left"
            size={28}
            color={canGoBack ? theme.colors.text : theme.colors.textSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, !canGoForward && styles.navButtonDisabled]}
          onPress={handleGoForward}
          disabled={!canGoForward}
        >
          <Icon
            name="chevron-right"
            size={28}
            color={canGoForward ? theme.colors.text : theme.colors.textSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={handleReload}>
          <Icon name="reload" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => Linking.openURL(currentUrl)}
        >
          <Icon name="open-in-new" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  headerButton: {
    padding: 8,
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  url: {
    fontSize: 11,
  },
  progressBar: {
    height: 3,
  },
  progressFill: {
    height: '100%',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#25D366',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  webview: {
    flex: 1,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 0.5,
    borderTopColor: '#E0E0E0',
  },
  navButton: {
    padding: 10,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
});

export default WebViewScreen;
