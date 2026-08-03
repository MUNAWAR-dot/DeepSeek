import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../config/theme';

const EmptyChat = ({ onStartChat }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <Animatable.View animation="fadeIn" delay={300} style={styles.container}>
      <Animatable.View animation="bounceIn" delay={500}>
        <View style={[styles.iconCircle, { backgroundColor: '#E8F5E8' }]}>
          <Icon name="chat-outline" size={60} color="#25D366" />
        </View>
      </Animatable.View>

      <Text style={[styles.title, { color: theme.colors.text }]}>
        {t('chats.noChats')}
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        {t('chats.startChat')}
      </Text>

      {onStartChat && (
        <TouchableOpacity style={styles.button} onPress={onStartChat}>
          <Icon name="message-plus" size={20} color="#fff" />
          <Text style={styles.buttonText}>Start a Conversation</Text>
        </TouchableOpacity>
      )}

      <View style={styles.features}>
        <View style={styles.featureItem}>
          <Icon name="message-text" size={20} color="#25D366" />
          <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>
            Send messages
          </Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="phone" size={20} color="#25D366" />
          <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>
            Make calls
          </Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="image" size={20} color="#25D366" />
          <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>
            Share media
          </Text>
        </View>
      </View>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 25,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#25D366',
    paddingHorizontal: 25,
    paddingVertical: 14,
    borderRadius: 25,
    gap: 8,
    marginBottom: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  features: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 14,
  },
});

export default EmptyChat;
