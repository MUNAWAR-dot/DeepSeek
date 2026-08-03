import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';
import FastImage from 'react-native-fast-image';
import Video from 'react-native-video';
import chatService from '../../services/chatService';
import { useTheme } from '../../config/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NUM_COLUMNS = 3;
const ITEM_SIZE = SCREEN_WIDTH / NUM_COLUMNS - 2;

const MediaPreviewScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { chatId } = route.params;
  
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, images, videos, documents
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const videoRef = useRef(null);

  useEffect(() => {
    loadMedia();
  }, [activeTab]);

  const loadMedia = async () => {
    try {
      setLoading(true);
      const mediaType = activeTab === 'all' ? null : activeTab === 'images' ? 'image' : 
                       activeTab === 'videos' ? 'video' : 'document';
      const mediaFiles = await chatService.getChatMedia(chatId, mediaType);
      setMedia(mediaFiles);
    } catch (error) {
      console.error('Load media failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderMediaItem = ({ item, index }) => {
    if (item.type === 'image') {
      return (
        <TouchableOpacity
          onPress={() => setSelectedIndex(index)}
          activeOpacity={0.8}
        >
          <FastImage
            source={{ uri: item.fileUrl }}
            style={styles.mediaItem}
            resizeMode="cover"
          />
        </TouchableOpacity>
      );
    }

    if (item.type === 'video') {
      return (
        <TouchableOpacity
          onPress={() => setSelectedIndex(index)}
          activeOpacity={0.8}
          style={styles.mediaItem}
        >
          <FastImage
            source={{ uri: item.thumbnail || item.fileUrl }}
            style={styles.videoThumbnail}
            resizeMode="cover"
          />
          <View style={styles.playIcon}>
            <Icon name="play-circle" size={30} color="#fff" />
          </View>
          {item.duration && (
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>
                {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      );
    }

    if (item.type === 'document') {
      return (
        <TouchableOpacity
          style={[styles.documentItem, { backgroundColor: theme.colors.surface }]}
          onPress={() => {
            // Open document
          }}
        >
          <Icon name="file-document" size={40} color={theme.colors.textSecondary} />
          <Text style={[styles.documentName, { color: theme.colors.text }]} numberOfLines={1}>
            {item.fileName}
          </Text>
        </TouchableOpacity>
      );
    }

    return null;
  };

  const renderTabs = () => (
    <View style={[styles.tabContainer, { backgroundColor: theme.colors.card }]}>
      {['all', 'images', 'videos', 'documents'].map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, activeTab === tab && styles.activeTab]}
          onPress={() => setActiveTab(tab)}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === tab && styles.activeTabText,
            ]}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Media, Links, and Docs
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {renderTabs()}

      {selectedIndex >= 0 && media[selectedIndex]?.type === 'image' && (
        <View style={styles.fullScreenPreview}>
          <TouchableOpacity
            style={styles.closePreview}
            onPress={() => setSelectedIndex(-1)}
          >
            <Icon name="close" size={30} color="#fff" />
          </TouchableOpacity>
          <FastImage
            source={{ uri: media[selectedIndex].fileUrl }}
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
        </View>
      )}

      <FlatList
        data={activeTab !== 'documents' ? media : media.filter(m => m.type === 'document')}
        renderItem={renderMediaItem}
        keyExtractor={(item) => item.id}
        numColumns={activeTab !== 'documents' ? NUM_COLUMNS : 1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.mediaGrid}
      />
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
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 20,
    marginHorizontal: 3,
  },
  activeTab: {
    backgroundColor: '#E8F5E8',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#667781',
  },
  activeTabText: {
    color: '#25D366',
  },
  mediaGrid: {
    padding: 1,
  },
  mediaItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    margin: 1,
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  playIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -15,
    marginTop: -15,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: '#fff',
    fontSize: 11,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 10,
    gap: 15,
  },
  documentName: {
    flex: 1,
    fontSize: 14,
  },
  fullScreenPreview: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closePreview: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  fullScreenImage: {
    width: SCREEN_WIDTH,
    height: '80%',
  },
});

export default MediaPreviewScreen;
