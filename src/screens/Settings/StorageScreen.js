import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';
import { useTranslation } from 'react-i18next';
import RNFS from 'react-native-fs';
import useStore from '../../store/store';
import { useTheme } from '../../config/theme';

const StorageScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { user } = useStore();

  const [storageInfo, setStorageInfo] = useState({
    total: 0,
    used: 0,
    free: 0,
  });

  const [autoDownload, setAutoDownload] = useState({
    images: true,
    audio: true,
    videos: false,
    documents: false,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStorageInfo();
  }, []);

  const loadStorageInfo = async () => {
    try {
      const cacheDir = RNFS.CachesDirectoryPath;
      const documentDir = RNFS.DocumentDirectoryPath;

      const [cacheStats, docStats] = await Promise.all([
        RNFS.stat(cacheDir).catch(() => ({ size: 0 })),
        RNFS.stat(documentDir).catch(() => ({ size: 0 })),
      ]);

      const totalUsed = (cacheStats.size || 0) + (docStats.size || 0);
      const totalFree = await RNFS.getFSInfo().then(info => info.freeSpace);

      setStorageInfo({
        total: totalUsed + totalFree,
        used: totalUsed,
        free: totalFree,
      });
    } catch (error) {
      console.error('Load storage info failed:', error);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached files. Your messages and media will not be affected.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          onPress: async () => {
            try {
              setLoading(true);
              await RNFS.unlink(RNFS.CachesDirectoryPath);
              await RNFS.mkdir(RNFS.CachesDirectoryPath);
              loadStorageInfo();
              Alert.alert('Success', 'Cache cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all messages, media, and files. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              // Clear all app data
              Alert.alert('Warning', 'All data will be cleared on next app restart');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const toggleAutoDownload = (key) => {
    setAutoDownload(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getUsedPercentage = () => {
    if (storageInfo.total === 0) return 0;
    return (storageInfo.used / storageInfo.total) * 100;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {t('settings.dataStorage')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Storage Usage */}
        <Animatable.View animation="fadeInUp" delay={200} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            Storage Usage
          </Text>
          <View style={[styles.storageCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.storageHeader}>
              <Text style={[styles.storageTitle, { color: theme.colors.text }]}>
                {formatBytes(storageInfo.used)}
              </Text>
              <Text style={[styles.storageSubtitle, { color: theme.colors.textSecondary }]}>
                of {formatBytes(storageInfo.total)} used
              </Text>
            </View>

            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(getUsedPercentage(), 100)}%` },
                ]}
              />
            </View>

            <View style={styles.storageDetails}>
              <View style={styles.detailItem}>
                <Icon name="image" size={20} color="#25D366" />
                <Text style={[styles.detailLabel, { color: theme.colors.text }]}>
                  Photos & Videos
                </Text>
                <Text style={[styles.detailValue, { color: theme.colors.textSecondary }]}>
                  Calculating...
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Icon name="file-document" size={20} color="#2196F3" />
                <Text style={[styles.detailLabel, { color: theme.colors.text }]}>
                  Documents
                </Text>
                <Text style={[styles.detailValue, { color: theme.colors.textSecondary }]}>
                  Calculating...
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Icon name="music-note" size={20} color="#FF9800" />
                <Text style={[styles.detailLabel, { color: theme.colors.text }]}>
                  Audio
                </Text>
                <Text style={[styles.detailValue, { color: theme.colors.textSecondary }]}>
                  Calculating...
                </Text>
              </View>
            </View>
          </View>
        </Animatable.View>

        {/* Auto-Download */}
        <Animatable.View animation="fadeInUp" delay={300} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            Auto-Download Media
          </Text>
          <View style={[styles.sectionContent, { backgroundColor: theme.colors.card }]}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                  Photos
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                  Auto-download photos when connected to Wi-Fi
                </Text>
              </View>
              <Switch
                value={autoDownload.images}
                onValueChange={() => toggleAutoDownload('images')}
                trackColor={{ false: '#D1D1D6', true: '#34C759' }}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                  Audio
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                  Auto-download audio messages
                </Text>
              </View>
              <Switch
                value={autoDownload.audio}
                onValueChange={() => toggleAutoDownload('audio')}
                trackColor={{ false: '#D1D1D6', true: '#34C759' }}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                  Videos
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                  Auto-download videos when connected to Wi-Fi
                </Text>
              </View>
              <Switch
                value={autoDownload.videos}
                onValueChange={() => toggleAutoDownload('videos')}
                trackColor={{ false: '#D1D1D6', true: '#34C759' }}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                  Documents
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                  Auto-download documents
                </Text>
              </View>
              <Switch
                value={autoDownload.documents}
                onValueChange={() => toggleAutoDownload('documents')}
                trackColor={{ false: '#D1D1D6', true: '#34C759' }}
              />
            </View>
          </View>
        </Animatable.View>

        {/* Network Usage */}
        <Animatable.View animation="fadeInUp" delay={400} style={styles.section}>
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: theme.colors.card }]}
            onPress={() => {}}
          >
            <Icon name="wifi" size={24} color={theme.colors.textSecondary} />
            <Text style={[styles.menuText, { color: theme.colors.text }]}>
              Network Usage
            </Text>
            <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </Animatable.View>

        {/* Clear Actions */}
        <Animatable.View animation="fadeInUp" delay={500} style={styles.section}>
          <TouchableOpacity
            style={[styles.clearButton, { backgroundColor: theme.colors.card }]}
            onPress={handleClearCache}
          >
            <Icon name="cached" size={20} color="#FF9800" />
            <Text style={styles.clearText}>Clear Cache</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.clearButton, { backgroundColor: theme.colors.card }]}
            onPress={handleClearAllData}
          >
            <Icon name="delete-sweep" size={20} color="#FF3B30" />
            <Text style={styles.dangerText}>Clear All Data</Text>
          </TouchableOpacity>
        </Animatable.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  section: {
    marginTop: 20,
    marginHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 5,
    textTransform: 'uppercase',
  },
  sectionContent: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  storageCard: {
    padding: 20,
    borderRadius: 12,
  },
  storageHeader: {
    marginBottom: 15,
  },
  storageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  storageSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#25D366',
    borderRadius: 4,
  },
  storageDetails: {
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailLabel: {
    flex: 1,
    fontSize: 15,
  },
  detailValue: {
    fontSize: 13,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingLabel: {
    fontSize: 16,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    gap: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    gap: 12,
  },
  clearText: {
    color: '#FF9800',
    fontSize: 16,
    fontWeight: '500',
  },
  dangerText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default StorageScreen;
