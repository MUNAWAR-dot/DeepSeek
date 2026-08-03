import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Avatar from '../Common/Avatar';
import { useTheme } from '../../config/theme';

const ContactCard = ({ contact, isMine, onPress }) => {
  const { theme } = useTheme();

  const handleCall = () => {
    if (contact.phoneNumber) {
      Linking.openURL(`tel:${contact.phoneNumber}`);
    }
  };

  const handleMessage = () => {
    if (contact.phoneNumber) {
      Linking.openURL(`sms:${contact.phoneNumber}`);
    }
  };

  const handleAddContact = () => {
    Alert.alert(
      'Add Contact',
      `Add ${contact.name} to your contacts?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: () => {
            // Add contact logic
            Alert.alert('Success', 'Contact added');
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: isMine ? '#E8F5E8' : theme.colors.surface },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Avatar
          uri={contact.photoURL}
          name={contact.name}
          size={50}
        />
        <View style={styles.contactInfo}>
          <Text
            style={[styles.contactName, { color: theme.colors.text }]}
            numberOfLines={1}
          >
            {contact.name || 'Unknown'}
          </Text>
          {contact.phoneNumber && (
            <Text style={[styles.phoneNumber, { color: theme.colors.textSecondary }]}>
              {contact.phoneNumber}
            </Text>
          )}
          {contact.email && (
            <Text style={[styles.email, { color: theme.colors.textSecondary }]}>
              {contact.email}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleMessage}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#E8F5E8' }]}>
            <Icon name="message-text" size={22} color="#25D366" />
          </View>
          <Text style={styles.actionText}>Message</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleCall}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}>
            <Icon name="phone" size={22} color="#2196F3" />
          </View>
          <Text style={styles.actionText}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleAddContact}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#FFF3E0' }]}>
            <Icon name="account-plus" size={22} color="#FF9800" />
          </View>
          <Text style={styles.actionText}>Add</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 12,
    minWidth: 250,
    maxWidth: 300,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  phoneNumber: {
    fontSize: 13,
  },
  email: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 0.5,
    borderTopColor: '#E0E0E0',
    paddingTop: 10,
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 11,
    color: '#667781',
  },
});

export default ContactCard;
