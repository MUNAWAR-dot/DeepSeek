import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';
import { useTheme } from '../../config/theme';

const ConfirmationDialog = ({
  visible,
  title,
  message,
  icon,
  iconColor = '#FF3B30',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  confirmDestructive = false,
  children,
}) => {
  const { theme } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={onCancel}
        />
        
        <Animatable.View
          animation="bounceIn"
          duration={500}
          style={[styles.dialog, { backgroundColor: theme.colors.card }]}
        >
          {icon && (
            <View style={styles.iconContainer}>
              <Icon name={icon} size={40} color={iconColor} />
            </View>
          )}

          {title && (
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {title}
            </Text>
          )}

          {message && (
            <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
              {message}
            </Text>
          )}

          {children}

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { borderColor: theme.colors.border }]}
              onPress={onCancel}
            >
              <Text style={[styles.cancelText, { color: theme.colors.text }]}>
                {cancelText}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                { backgroundColor: confirmDestructive ? '#FF3B30' : '#25D366' },
              ]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </Animatable.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  dialog: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 25,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    elevation: 2,
  },
  confirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ConfirmationDialog;
