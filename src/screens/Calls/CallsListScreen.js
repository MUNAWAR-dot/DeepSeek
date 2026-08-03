import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { format } from 'date-fns';
import useStore from '../../store/store';
import callService from '../../services/callService';
import Avatar from '../../components/Common/Avatar';
import { useTheme } from '../../config/theme';

const CallsListScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [calls, setCalls] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, missed

  const { user, onlineUsers } = useStore();

  useFocusEffect(
    useCallback(() => {
      loadCalls();
    }, [])
  );

  const loadCalls = async () => {
    try {
      setLoading(true);
      const callHistory = await callService.getCallHistory();
      setCalls(callHistory);
    } catch (error) {
      console.error('Load calls failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCalls();
    setRefreshing(false);
  };

  const filteredCalls = activeTab === 'missed' 
    ? calls.filter(call => call.status === 'missed')
    : calls;

  const getCallIcon = (call) => {
    if (call.type === 'video') {
      return 'video';
    }
    return 'phone';
  };

  const getCallStatusColor = (status) => {
    switch (status) {
      case 'missed':
      case 'rejected':
        return '#FF3B30';
      case 'ended':
        return '#25D366';
      default:
        return '#667781';
    }
  };

  const getCallStatusText = (call) => {
    if (call.status === 'missed') {
      return 'Missed';
    }
    if (call.status === 'rejected') {
      return 'Rejected';
    }
    if (call.type === 'video') {
      return 'Video call';
    }
    return 'Voice call';
  };

  const formatCallTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp?.toDate?.() || new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 24 * 60 * 60 * 1000) {
      return format(date, 'h:mm a');
    } else if (diff < 7 * 24 * 60 * 60 * 1000) {
      return format(date, 'EEE h:mm a');
    } else {
      return format(date, 'dd/MM/yy h:mm a');
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins} min ${secs}s`;
    }
    return `${secs}s`;
  };

  const handleCallPress = (call) => {
    const otherUserId = call.callerId === user?.uid ? call.receiverId : call.callerId;
    
    Alert.alert(
      'Call',
      'What would you like to do?',
      [
        {
          text: 'Voice Call',
          onPress: () => navigation.navigate('VoiceCall', { userId: otherUserId }),
        },
        {
          text: 'Video Call',
          onPress: () => navigation.navigate('VideoCall', { userId: otherUserId }),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleNewCall = () => {
    navigation.navigate('ContactPicker', {
      mode: 'call',
      onContactSelect: (contact) => {
        Alert.alert(
          'Call Type',
          'Choose call type',
          [
            {
              text: 'Voice Call',
              onPress: () => navigation.navigate('VoiceCall', { userId: contact.id }),
            },
            {
              text: 'Video Call',
              onPress: () => navigation.navigate('VideoCall', { userId: contact.id }),
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      },
    });
  };

  const renderHeader = () => (
    <Animatable.View
      animation="fadeInDown"
      duration={500}
      style={[styles.header, { backgroundColor: theme.colors.primary }]}
    >
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>{t('calls.title')}</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            onPress={() => navigation.navigate('QRCodeScanner')}
            style={styles.headerIcon}
          >
            <Icon name="qrcode-scan" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleNewCall}
            style={styles.headerIcon}
          >
            <Icon name="phone-plus" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Icon name="dots-vertical" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'all' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('all')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'all' && styles.activeTabText,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'missed' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('missed')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'missed' && styles.activeTabText,
            ]}
          >
            Missed
          </Text>
        </TouchableOpacity>
      </View>
    </Animatable.View>
  );

  const renderCallItem = ({ item, index }) => {
    const otherUserId = item.callerId === user?.uid ? item.receiverId : item.callerId;
    const isIncoming = item.receiverId === user?.uid;
    const isOnline = onlineUsers.has(otherUserId);

    return (
      <Animatable.View
        animation="fadeInRight"
        duration={500}
        delay={index * 50}
      >
        <TouchableOpacity
          style={[styles.callItem, { backgroundColor: theme.colors.card }]}
          onPress={() => handleCallPress(item)}
          activeOpacity={0.7}
        >
          <View style={styles.avatarContainer}>
            <Avatar
              name={otherUserId}
              size={50}
              isOnline={isOnline}
            />
          </View>

          <View style={styles.callInfo}>
            <Text
              style={[
                styles.callName,
                { color: theme.colors.text },
                item.status === 'missed' && styles.missedCallText,
              ]}
              numberOfLines={1}
            >
              {otherUserId}
            </Text>
            <View style={styles.callDetails}>
              <Icon
                name={isIncoming ? 'arrow-down-left' : 'arrow-up-right'}
                size={14}
                color={getCallStatusColor(item.status)}
              />
              <Text
                style={[
                  styles.callType,
                  { color: getCallStatusColor(item.status) },
                ]}
              >
                {getCallStatusText(item)}
              </Text>
              {item.duration > 0 && (
                <Text style={[styles.callDuration, { color: theme.colors.textSecondary }]}>
                  • {formatDuration(item.duration)}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.callActions}>
            <Text style={[styles.callTime, { color: theme.colors.textSecondary }]}>
              {formatCallTime(item.startTime || item.createdAt)}
            </Text>
            <TouchableOpacity
              style={styles.callButton}
              onPress={() => {
                navigation.navigate(
                  item.type === 'video' ? 'VideoCall' : 'VoiceCall',
                  { userId: otherUserId }
                );
              }}
            >
              <Icon
                name={item.type === 'video' ? 'video' : 'phone'}
                size={22}
                color="#25D366"
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animatable.View>
    );
  };

  const renderEmptyList = () => (
    <Animatable.View animation="fadeIn" delay={500} style={styles.emptyContainer}>
      <Icon name="phone-outline" size={80} color={theme.colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        {t('calls.noCalls')}
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
        Make a voice or video call to get started
      </Text>
      <TouchableOpacity
        style={styles.newCallButton}
        onPress={handleNewCall}
      >
        <Icon name="phone-plus" size={20} color="#fff" />
        <Text style={styles.newCallButtonText}>New Call</Text>
      </TouchableOpacity>
    </Animatable.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      {renderHeader()}

      <FlatList
        data={filteredCalls}
        keyExtractor={(item) => item.id}
        renderItem={renderCallItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={renderEmptyList}
        contentContainerStyle={filteredCalls.length === 0 && styles.emptyList}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 10,
    paddingBottom: 0,
    paddingHorizontal: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  headerIcon: {
    padding: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    marginTop: 5,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#fff',
  },
  tabText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
  },
  callItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 15,
  },
  avatarContainer: {
    marginRight: 15,
  },
  callInfo: {
    flex: 1,
  },
  callName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  missedCallText: {
    color: '#FF3B30',
    fontWeight: '600',
  },
  callDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  callType: {
    fontSize: 13,
  },
  callDuration: {
    fontSize: 13,
  },
  callActions: {
    alignItems: 'flex-end',
    gap: 4,
  },
  callTime: {
    fontSize: 12,
  },
  callButton: {
    padding: 5,
  },
  separator: {
    height: 0.5,
    marginLeft: 77,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
  newCallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#25D366',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
    gap: 8,
  },
  newCallButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CallsListScreen;
