import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  StatusBar,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';
import ImagePicker from 'react-native-image-crop-picker';
import useStore from '../../store/store';
import Avatar from '../../components/Common/Avatar';
import chatService from '../../services/chatService';
import { useTheme } from '../../config/theme';

const NewGroupScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { selectedContacts = [] } = route.params || {};
  const { user } = useStore();

  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupIcon, setGroupIcon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [participants, setParticipants] = useState(selectedContacts);

  const handlePickIcon = async () => {
    Alert.alert(
      'Group Icon',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            try {
              const image = await ImagePicker.openCamera({
                width: 400,
                height: 400,
                cropping: true,
                cropperCircleOverlay: true,
              });
              setGroupIcon(image.path);
            } catch (error) {
              console.log('Camera cancelled');
            }
          },
        },
        {
          text: 'Choose from Gallery',
          onPress: async () => {
            try {
              const image = await ImagePicker.openPicker({
                width: 400,
                height: 400,
                cropping: true,
                cropperCircleOverlay: true,
              });
              setGroupIcon(image.path);
            } catch (error) {
              console.log('Gallery cancelled');
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleAddParticipants = () => {
    navigation.navigate('ContactPicker', {
      mode: 'addParticipants',
      onContactsSelect: (contacts) => {
        setParticipants([...participants, ...contacts]);
      },
      alreadySelected: participants.map(c => c.appUserId || c.id),
    });
  };

  const handleRemoveParticipant = (participantId) => {
    setParticipants(participants.filter(p => (p.appUserId || p.id) !== participantId));
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    if (participants.length < 1) {
      Alert.alert('Error', 'Please add at least one participant');
      return;
    }

    try {
      setLoading(true);

      const participantIds = participants.map(p => p.appUserId || p.id);
      
      // Create group chat
      const chat = await chatService.createChat(
        [...participantIds, user.uid],
        true,
        {
          name: groupName.trim(),
          description: groupDescription.trim(),
        }
      );

      // Upload group icon if selected
      if (groupIcon) {
        await chatService.updateGroupPhoto(chat.id, groupIcon);
      }

      navigation.replace('ChatRoom', {
        chatId: chat.id,
        chatName: groupName.trim(),
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          New Group
        </Text>
        <TouchableOpacity
          onPress={handleCreateGroup}
          disabled={loading || !groupName.trim()}
          style={styles.createButton}
        >
          <Text
            style={[
              styles.createText,
              (!groupName.trim() || loading) && styles.createTextDisabled,
            ]}
          >
            {loading ? 'Creating...' : 'Create'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Group Icon */}
        <Animatable.View animation="fadeInUp" delay={200} style={styles.iconSection}>
          <TouchableOpacity onPress={handlePickIcon}>
            {groupIcon ? (
              <Image source={{ uri: groupIcon }} style={styles.groupIcon} />
            ) : (
              <View style={[styles.iconPlaceholder, { backgroundColor: '#E8F5E8' }]}>
                <Icon name="camera-plus" size={40} color="#25D366" />
              </View>
            )}
            <View style={styles.cameraIcon}>
              <Icon name="camera" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={[styles.iconLabel, { color: theme.colors.textSecondary }]}>
            Add Group Icon
          </Text>
        </Animatable.View>

        {/* Group Info */}
        <Animatable.View animation="fadeInUp" delay={300} style={styles.infoSection}>
          <TextInput
            style={[styles.nameInput, { color: theme.colors.text, backgroundColor: theme.colors.card }]}
            placeholder="Group Name"
            placeholderTextColor={theme.colors.textSecondary}
            value={groupName}
            onChangeText={setGroupName}
            maxLength={25}
          />
          <Text style={[styles.charCount, { color: theme.colors.textSecondary }]}>
            {groupName.length}/25
          </Text>

          <TextInput
            style={[
              styles.descriptionInput,
              { color: theme.colors.text, backgroundColor: theme.colors.card },
            ]}
            placeholder="Group Description (optional)"
            placeholderTextColor={theme.colors.textSecondary}
            value={groupDescription}
            onChangeText={setGroupDescription}
            multiline
            maxLength={200}
          />
        </Animatable.View>

        {/* Participants */}
        <Animatable.View animation="fadeInUp" delay={400} style={styles.participantsSection}>
          <View style={styles.participantsHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
              Participants: {participants.length}
            </Text>
            <TouchableOpacity onPress={handleAddParticipants}>
              <Icon name="account-plus" size={24} color="#25D366" />
            </TouchableOpacity>
          </View>

          {participants.map((participant, index) => (
            <Animatable.View
              key={participant.appUserId || participant.id || index}
              animation="fadeInRight"
              duration={300}
              delay={index * 30}
              style={[styles.participantItem, { backgroundColor: theme.colors.card }]}
            >
              <Avatar
                uri={participant.photoURL || participant.thumbnailPath}
                name={participant.displayName || participant.name}
                size={45}
              />
              <Text style={[styles.participantName, { color: theme.colors.text }]}>
                {participant.displayName || participant.name}
              </Text>
              <TouchableOpacity
                onPress={() => handleRemoveParticipant(participant.appUserId || participant.id)}
                style={styles.removeButton}
              >
                <Icon name="close-circle" size={22} color="#FF3B30" />
              </TouchableOpacity>
            </Animatable.View>
          ))}

          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.colors.card }]}
            onPress={handleAddParticipants}
          >
            <View style={styles.addIcon}>
              <Icon name="plus" size={24} color="#25D366" />
            </View>
            <Text style={[styles.addText, { color: '#25D366' }]}>
              Add Participants
            </Text>
          </TouchableOpacity>
        </Animatable.View>

        {/* Group Settings */}
        <Animatable.View animation="fadeInUp" delay={500} style={styles.settingsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            Group Settings
          </Text>
          
          <TouchableOpacity style={[styles.settingItem, { backgroundColor: theme.colors.card }]}>
            <Icon name="lock" size={22} color={theme.colors.textSecondary} />
            <Text style={[styles.settingText, { color: theme.colors.text }]}>
              Group Privacy
            </Text>
            <Text style={[styles.settingValue, { color: theme.colors.textSecondary }]}>
              Private
            </Text>
            <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingItem, { backgroundColor: theme.colors.card }]}>
            <Icon name="send" size={22} color={theme.colors.textSecondary} />
            <Text style={[styles.settingText, { color: theme.colors.text }]}>
              Who can send messages
            </Text>
            <Text style={[styles.settingValue, { color: theme.colors.textSecondary }]}>
              All Participants
            </Text>
            <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
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
  createButton: {
    padding: 8,
  },
  createText: {
    color: '#25D366',
    fontSize: 16,
    fontWeight: '600',
  },
  createTextDisabled: {
    opacity: 0.5,
  },
  iconSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  groupIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  iconPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#25D366',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  iconLabel: {
    marginTop: 10,
    fontSize: 14,
  },
  infoSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  nameInput: {
    fontSize: 18,
    fontWeight: '500',
    padding: 15,
    borderRadius: 12,
    marginBottom: 4,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginRight: 10,
    marginBottom: 15,
  },
  descriptionInput: {
    fontSize: 16,
    padding: 15,
    borderRadius: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  participantsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  participantsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    gap: 12,
  },
  participantName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  removeButton: {
    padding: 5,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 12,
  },
  addIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addText: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 8,
    gap: 12,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
  },
  settingValue: {
    fontSize: 14,
    marginRight: 5,
  },
  bottomPadding: {
    height: 40,
  },
});

export default NewGroupScreen;
