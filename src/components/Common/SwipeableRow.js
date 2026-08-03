import React, { useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const SwipeableRow = ({
  children,
  leftActions = [],
  rightActions = [],
  onSwipeableOpen,
  enabled = true,
}) => {
  const swipeableRef = useRef(null);

  const renderLeftActions = (progress, dragX) => {
    if (leftActions.length === 0) return null;

    return (
      <View style={styles.actionsContainer}>
        {leftActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.action, { backgroundColor: action.color || '#007AFF' }]}
            onPress={() => {
              action.onPress?.();
              swipeableRef.current?.close();
            }}
          >
            <Animated.View style={styles.actionContent}>
              <Icon name={action.icon} size={22} color="#fff" />
              <Text style={styles.actionText}>{action.text}</Text>
            </Animated.View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderRightActions = (progress, dragX) => {
    if (rightActions.length === 0) return null;

    const trans = dragX.interpolate({
      inputRange: [-100 * rightActions.length, 0],
      outputRange: [0, 100 * rightActions.length],
    });

    return (
      <View style={styles.actionsContainer}>
        {rightActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.action, { backgroundColor: action.color || '#FF3B30' }]}
            onPress={() => {
              action.onPress?.();
              swipeableRef.current?.close();
            }}
          >
            <Animated.View
              style={[
                styles.actionContent,
                { transform: [{ translateX: trans }] },
              ]}
            >
              <Icon name={action.icon} size={22} color="#fff" />
              <Text style={styles.actionText}>{action.text}</Text>
            </Animated.View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      onSwipeableOpen={onSwipeableOpen}
      enabled={enabled}
      overshootLeft={false}
      overshootRight={false}
    >
      {children}
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  actionsContainer: {
    flexDirection: 'row',
    height: '100%',
  },
  action: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 75,
    height: '100%',
  },
  actionContent: {
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '500',
  },
});

export default SwipeableRow;
