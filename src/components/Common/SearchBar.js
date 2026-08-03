import React, { useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../config/theme';

const SearchBar = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  onFocus,
  onBlur,
  autoFocus = false,
  showCancel = false,
  onCancel,
  style,
  ...props
}) => {
  const { theme } = useTheme();
  const inputRef = useRef(null);
  const cancelAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(cancelAnim, {
      toValue: showCancel ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [showCancel]);

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 500);
    }
  }, [autoFocus]);

  const handleClear = () => {
    onChangeText?.('');
    inputRef.current?.focus();
  };

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface }]}>
        <Icon name="magnify" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
        
        <TextInput
          ref={inputRef}
          style={[styles.input, { color: theme.colors.text }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          onFocus={onFocus}
          onBlur={onBlur}
          returnKeyType="search"
          autoCorrect={false}
          {...props}
        />
        
        {value && value.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Icon name="close-circle" size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {showCancel && (
        <Animated.View
          style={[
            styles.cancelButton,
            {
              opacity: cancelAnim,
              transform: [
                {
                  translateX: cancelAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity onPress={onCancel}>
            <Animated.Text style={[styles.cancelText, { color: theme.colors.text }]}>
              Cancel
            </Animated.Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
  },
  cancelButton: {
    marginLeft: 10,
  },
  cancelText: {
    fontSize: 16,
  },
});

export default SearchBar;
