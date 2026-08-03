import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';
import Avatar from '../Common/Avatar';
import { useTheme } from '../../config/theme';

const StatusItem = memo(({ status, index, viewed = false, onPress }) => {
  const { theme } = useTheme();

  const getStatusTime = () => {
    if (!status.latestTimestamp) return '';
    
    const date = status.latestTimestamp?.toDate?.() || new Date(status.latestTimestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60 * 60 * 1000) {
      const minutes = Math.floor(diff / (60 * 1000));
      return `${minutes}m ago`;
    } else if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000));
      return `${hours}h ago`;
    } else {
      return format(date, 'dd/MM/yyyy');
    }
  };

  const hasUnviewedStatuses = () => {
    return status.statuses?.some((s) => !s.viewed);
  };

  return (
    <Animatable.View
      animation="fadeInRight"
      duration={500}
      delay={index * 50}
    >
      <TouchableOpacity
        style={[styles.container, { backgroundColor: theme.colors.card }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          <Avatar
            uri={status.userAvatar}
            name={status.userName || 'User'}
            size={50}
            isOnline={false}
          />
          <View
            style={[
              styles.statusRing,
              hasUnviewedStatuses()
                ? { borderColor: '#25D366' }
                : { borderColor: '#BDBDBD' },
            ]}
          />
        </View>

        <View style={styles.contentContainer}>
          <Text
            style={[
              styles.name,
              { color: theme.colors.text },
              hasUnviewedStatuses() && styles.unviewedName,
            ]}
            numberOfLines={1}
          >
            {status.userName || 'User'}
          </Text>
          <Text
            style={[
              styles.time,
              { color: theme.colors.textSecondary },
            ]}
          >
            {getStatusTime()}
          </Text>
        </View>

        {hasUnviewedStatuses() && (
          <View style={styles.unviewedDot} />
        )}
      </TouchableOpacity>
    </Animatable.View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 15,
  },
  avatarContainer: {
    marginRight: 15,
    position: 'relative',
  },
  statusRing: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 27,
    borderWidth: 2,
  },
  contentContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  unviewedName: {
    fontWeight: 'bold',
  },
  time: {
    fontSize: 13,
  },
  unviewedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#25D366',
  },
});

export default StatusItem;
