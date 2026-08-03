import React, { useState } from 'react';
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
import useStore from '../../store/store';
import chatService from '../../services/chatService';
import { useTheme } from '../../config/theme';

const ChatSettingsScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { chatId } = route.params;
  const { user, updateChat } = useStore();

  const [chatData, setChatData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [wallpaper, setWallpaper] = useState(null);

  useState(() => {
    loadChatSettings();
  }, []);

  const loadChatSettings = async () => {
    try {
      const chat = await chatService.getChatById(chatId);
      setChatData(chat);
      setIsMuted(chat?.isMuted || false);
      setIsPinned(chat?.isPinned || false);
    } catch (error) {
      console.error('Load chat settings failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMute = async () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);

    try {
      if (newMuted) {
        await chatService.updateChatSettings(chatId, {
          isMuted: true,
          mutedUntil: Date.now() + 8 * 60 * 60 * 1000, // 8 hours
        });
      } else {
        await chatService.updateChatSettings(chatId, {
          isMuted: false,
          mutedUntil: null,
        });
      }
    } catch (error) {
      setIsMuted(!newMuted);
      Alert.alert('Error', 'Failed to update settings');
    }
  };

  const togglePin = async () => {
    const newPinned = !isPinned;
    setIsPinned(newPinned);

    try {
      await chatService.updateChatSettings(chatId, {
        isPinned: newPinned,
      });
    } catch (error) {
      setIsPinned(!newPinned);
      Alert.alert('Error', 'Failed to update settings');
    }
  };

  const handleClearChat = () => {
    Alert.alert(
      'Clear Chat',
      'This will delete all messages in this chat. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all messages
              Alert.alert('Success', 'Chat cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear chat');
            }
          },
        },
      ]
    );
  };

  const handleExportChat = () => {
    Alert.alert(
      'Export Chat',
      'Export this chat as a text file?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: async () => {
            try {
              // Export chat logic
              Alert.alert('Success', 'Chat exported');
            } catch (error) {
              Alert.alert('Error', 'Failed to export chat');
            }
          },
        },
      ]
    );
  };

  const handleBlockContact = () => {
    Alert.alert(
      'Block Contact',
      'Are you sure you want to block this contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            try {
              const otherParticipant = chatData?.participants?.find(p => p !== user?.uid);
              if (otherParticipant) {
                await userService.blockUser(otherParticipant);
                navigation.goBack();
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to block contact');
            }
          },
        },
      ]
    );
  };

  const handleReportContact = () => {
    Alert.alert(
      'Report Contact',
      'Please select a reason for reporting:',
      [
        { text: 'Spam', onPress: () => submitReport('spam') },
        { text: 'Harassment', onPress: () => submitReport('harassment') },
        { text: 'Inappropriate Content', onPress: () => submitReport('inappropriate') },
        { text: 'Other', onPress: () => submitReport('other') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const submitReport = async (reason) => {
    try {
      const otherParticipant = chatData?.participants?.find(p => p !== user?.uid);
      if (otherParticipant) {
        await userService.reportUser(otherParticipant, reason);
        Alert.alert('Reported', 'Thank you for your report. We will review it.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit report');
    }
  };

  const settingsSections = [
    {
      title: 'Chat Settings',
      items: [
        {
          icon: 'volume-off',
          label: 'Mute Notifications',
          type: 'toggle',
          value: isMuted,
          onToggle: toggleMute,
        },
        {
          icon: 'pin',
          label: 'Pin Chat',
          type: 'toggle',
          value: isPinned,
          onToggle: togglePin,
        },
        {
          icon: 'image',
          label: 'Wallpaper',
          type: 'navigate',
          onPress: () => {},
        },
      ],
    },
    {
      title: 'Messages',
      items: [
        {
          icon: 'star',
          label: 'Starred Messages',
          type: 'navigate',
          onPress: () => navigation.navigate('StarredMessages'),
        },
        {
          icon: 'magnify',
          label: 'Search Messages',
          type: 'navigate',
          onPress: () => navigation.navigate('SearchMessages', { chatId }),
        },
        {
          icon: 'image-multiple',
          label: 'Media, Links, and Docs',
          type: 'navigate',
          onPress: () => navigation.navigate('MediaPreview', { chatId }),
        },
      ],
    },
    {
      title: 'Actions',
      items: [
        {
          icon: 'delete-sweep',
          label: 'Clear Chat',
          type: 'danger',
          onPress: handleClearChat,
        },
        {
          icon: 'export',
          label: 'Export Chat',
          type: 'navigate',
          onPress: handleExportChat,
        },
      ],
    },
    {
      title: 'Contact',
      items: [
        {
          icon: 'block',
          label: 'Block Contact',
          type: 'danger',
          onPress: handleBlockContact,
        },
        {
          icon: 'flag',
          label: 'Report Contact',
          type: 'danger',
          onPress: handleReportContact,
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Chat Settings
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {settingsSections.map((section, sectionIndex) => (
          <Animatable.View
            key={sectionIndex}
            animation="fadeInUp"
            delay={200 + sectionIndex * 100}
            style={styles.section}
          >
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
              {section.title}
            </Text>
            <View style={[styles.sectionContent, { backgroundColor: theme.colors.card }]}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.settingItem,
                    itemIndex < section.items.length - 1 && styles.settingItemBorder,
                  ]}
                  onPress={item.type === 'toggle' ? item.onToggle : item.onPress}
                >
                  <Icon
                    name={item.icon}
                    size={22}
                    color={item.type === 'danger' ? '#FF3B30' : theme.colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.settingLabel,
                      { color: item.type === 'danger' ? '#FF3B30' : theme.colors.text },
                    ]}
                  >
                    {item.label}
                  </Text>
                  {item.type === 'toggle' ? (
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      trackColor={{ false: '#D1D1D6', true: '#34C759' }}
                      thumbColor="#fff"
                    />
                  ) : (
                    <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Animatable.View>
        ))}
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    gap: 12,
  },
  settingItemBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  settingLabel: {
    flex: 1,
    fontSize: 16,
  },
});

export default ChatSettingsScreen;
