import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';
import ImagePicker from 'react-native-image-crop-picker';
import useStore from '../../store/store';
import { useTheme } from '../../config/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const THUMBNAIL_SIZE = (SCREEN_WIDTH - 60) / 3;

const defaultWallpapers = [
  {
    id: 'default',
    name: 'Default',
    source: null,
    color: '#ECE5DD',
  },
  {
    id: 'gradient1',
    name: 'Gradient',
    source: null,
    colors: ['#667eea', '#764ba2'],
  },
  {
    id: 'nature1',
    name: 'Nature',
    source: require('../../assets/wallpapers/nature1.jpg'),
  },
  {
    id: 'nature2',
    name: 'Leaves',
    source: require('../../assets/wallpapers/nature2.jpg'),
  },
  {
    id: 'dark1',
    name: 'Dark',
    source: null,
    color: '#1a1a2e',
  },
  {
    id: 'light1',
    name: 'Light',
    source: null,
    color: '#f5f5f5',
  },
  {
    id: 'pattern1',
    name: 'Pattern',
    source: require('../../assets/wallpapers/pattern1.jpg'),
  },
  {
    id: 'pattern2',
    name: 'Geometric',
    source: require('../../assets/wallpapers/pattern2.jpg'),
  },
  {
    id: 'solid1',
    name: 'Solid Green',
    source: null,
    color: '#E8F5E8',
  },
];

const ChatWallpaperScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { chatId } = route.params || {};
  const { setChatWallpaper, chatWallpaper } = useStore();
  
  const [selectedWallpaper, setSelectedWallpaper] = useState(chatWallpaper);
  const [loading, setLoading] = useState(false);

  const handleSelectWallpaper = async (wallpaper) => {
    setSelectedWallpaper(wallpaper.id);
    
    if (chatId) {
      try {
        setLoading(true);
        // Save wallpaper for specific chat
        await setChatWallpaper(chatId, wallpaper);
      } catch (error) {
        Alert.alert('Error', 'Failed to set wallpaper');
      } finally {
        setLoading(false);
      }
    } else {
      // Set default wallpaper for all chats
      setChatWallpaper(null, wallpaper);
    }
  };

  const handleCustomWallpaper = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: SCREEN_WIDTH * 2,
        height: SCREEN_WIDTH * 2,
        cropping: false,
        compressImageQuality: 0.8,
      });
      
      if (image) {
        const customWallpaper = {
          id: 'custom',
          name: 'Custom',
          source: { uri: image.path },
        };
        
        setSelectedWallpaper('custom');
        if (chatId) {
          await setChatWallpaper(chatId, customWallpaper);
        } else {
          setChatWallpaper(null, customWallpaper);
        }
      }
    } catch (error) {
      console.log('Image picker cancelled');
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Wallpaper',
      'Reset to default wallpaper?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: () => {
            handleSelectWallpaper(defaultWallpapers[0]);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Chat Wallpaper
        </Text>
        <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Custom Wallpaper Button */}
        <Animatable.View animation="fadeInUp" delay={200} style={styles.customSection}>
          <TouchableOpacity
            style={[styles.customButton, { backgroundColor: theme.colors.card }]}
            onPress={handleCustomWallpaper}
          >
            <Icon name="image-plus" size={30} color="#25D366" />
            <View style={styles.customText}>
              <Text style={[styles.customTitle, { color: theme.colors.text }]}>
                Choose Custom Wallpaper
              </Text>
              <Text style={[styles.customSubtitle, { color: theme.colors.textSecondary }]}>
                Select a photo from your gallery
              </Text>
            </View>
            <Icon name="chevron-right" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </Animatable.View>

        {/* Default Wallpapers */}
        <Animatable.View animation="fadeInUp" delay={400} style={styles.wallpapersSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            Default Wallpapers
          </Text>
          
          <View style={styles.wallpaperGrid}>
            {defaultWallpapers.map((wallpaper, index) => (
              <Animatable.View
                key={wallpaper.id}
                animation="fadeInUp"
                delay={400 + index * 50}
              >
                <TouchableOpacity
                  style={styles.wallpaperItem}
                  onPress={() => handleSelectWallpaper(wallpaper)}
                >
                  {wallpaper.source ? (
                    <Image
                      source={wallpaper.source}
                      style={styles.wallpaperThumbnail}
                    />
                  ) : wallpaper.colors ? (
                    <View
                      style={[
                        styles.wallpaperThumbnail,
                        {
                          backgroundGradient: `linear-gradient(135deg, ${wallpaper.colors.join(', ')})`,
                        },
                      ]}
                    >
                      <LinearGradient
                        colors={wallpaper.colors}
                        style={styles.gradient}
                      />
                    </View>
                  ) : (
                    <View
                      style={[
                        styles.wallpaperThumbnail,
                        { backgroundColor: wallpaper.color || '#ECE5DD' },
                      ]}
                    />
                  )}
                  
                  {selectedWallpaper === wallpaper.id && (
                    <View style={styles.selectedOverlay}>
                      <Icon name="check-circle" size={28} color="#25D366" />
                    </View>
                  )}
                  
                  <Text style={[styles.wallpaperName, { color: theme.colors.textSecondary }]}>
                    {wallpaper.name}
                  </Text>
                </TouchableOpacity>
              </Animatable.View>
            ))}
          </View>
        </Animatable.View>

        <View style={styles.bottomPadding} />
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
  resetButton: {
    padding: 5,
  },
  resetText: {
    color: '#FF3B30',
    fontSize: 16,
  },
  customSection: {
    padding: 20,
  },
  customButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
    gap: 15,
  },
  customText: {
    flex: 1,
  },
  customTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  customSubtitle: {
    fontSize: 13,
  },
  wallpapersSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 15,
    textTransform: 'uppercase',
  },
  wallpaperGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  wallpaperItem: {
    width: THUMBNAIL_SIZE,
    marginBottom: 15,
  },
  wallpaperThumbnail: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE * 1.3,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wallpaperName: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
  },
  bottomPadding: {
    height: 40,
  },
});

export default ChatWallpaperScreen;
