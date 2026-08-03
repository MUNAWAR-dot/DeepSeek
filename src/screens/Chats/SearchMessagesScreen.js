import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';
import { format } from 'date-fns';
import chatService from '../../services/chatService';
import { useTheme } from '../../config/theme';

const SearchMessagesScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { chatId } = route.params || {};
  
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (text) => {
    setSearchQuery(text);
    
    if (text.length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    try {
      setLoading(true);
      setHasSearched(true);
      
      const messages = await chatService.searchMessages(chatId, text);
      setResults(messages);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResultPress = (message) => {
    navigation.navigate('ChatRoom', {
      chatId,
      scrollToMessage: message.id,
    });
  };

  const getMessagePreview = (message) => {
    switch (message.type) {
      case 'text':
        return message.content;
      case 'image':
        return '📷 Image';
      case 'video':
        return '🎥 Video';
      case 'audio':
        return '🎵 Voice message';
      case 'document':
        return '📄 Document';
      default:
        return message.content;
    }
  };

  const highlightText = (text, query) => {
    if (!query) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <Text key={index} style={styles.highlight}>{part}</Text>
      ) : (
        <Text key={index}>{part}</Text>
      )
    );
  };

  const renderResult = ({ item, index }) => (
    <Animatable.View animation="fadeInRight" duration={300} delay={index * 30}>
      <TouchableOpacity
        style={[styles.resultItem, { backgroundColor: theme.colors.card }]}
        onPress={() => handleResultPress(item)}
      >
        <View style={styles.resultHeader}>
          <Text style={[styles.resultDate, { color: theme.colors.textSecondary }]}>
            {format(
              item.timestamp?.toDate?.() || new Date(item.timestamp),
              'dd/MM/yyyy h:mm a'
            )}
          </Text>
        </View>
        <Text style={[styles.resultText, { color: theme.colors.text }]} numberOfLines={3}>
          {highlightText(getMessagePreview(item), searchQuery)}
        </Text>
      </TouchableOpacity>
    </Animatable.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        
        <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface }]}>
          <Icon name="magnify" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Search messages..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Icon name="close" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#25D366" />
        </View>
      ) : hasSearched && results.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="text-search" size={60} color={theme.colors.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            No messages found
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderResult}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.resultsList}
          ItemSeparatorComponent={() => (
            <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />
          )}
        />
      )}

      {results.length > 0 && (
        <View style={[styles.resultCount, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.resultCountText, { color: theme.colors.textSecondary }]}>
            {results.length} message{results.length !== 1 ? 's' : ''} found
          </Text>
        </View>
      )}
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
    padding: 10,
    paddingRight: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
    gap: 10,
  },
  backButton: {
    padding: 5,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginTop: 15,
  },
  resultsList: {
    paddingVertical: 10,
  },
  resultItem: {
    padding: 15,
    marginHorizontal: 10,
    marginVertical: 4,
    borderRadius: 10,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resultDate: {
    fontSize: 12,
  },
  resultText: {
    fontSize: 15,
    lineHeight: 22,
  },
  highlight: {
    backgroundColor: '#FFEB3B',
    fontWeight: 'bold',
  },
  separator: {
    height: 0.5,
  },
  resultCount: {
    padding: 10,
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: '#E0E0E0',
  },
  resultCountText: {
    fontSize: 12,
  },
});

export default SearchMessagesScreen;
