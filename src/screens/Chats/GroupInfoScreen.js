import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StatusBar,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';
import ImagePicker from 'react-native-image-crop-picker';
import useStore from '../../store/store';
import Avatar from '../../components/Common/Avatar';
import chatService from '../../services/chatService';
import userService from '../../services/userService';
import { useTheme } from '../../config/theme';

const GroupInfoScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { chatId } = route.params;
  const { user } = useStore();

  const [groupData, setGroupData] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadGroupInfo();
  }, [chatId]);

  const loadGroupInfo = async () => {
    try {
      setLoading(true);
      const chat = await chatService.getChatById(chatId);
      if (chat) {
        setGroupData(chat);
        setGroupName(chat.groupName || '');
        setGroupDescription(chat.groupDescription || '');
        setIsAdmin(chat.groupAdmins?.includes(user?.uid));

        // Load participant details
        const participantDetails = [];
        for (const participantId of chat.participants || []) {
          const userData = await userService.getUserProfile(participantId);
          if (userData) {
            participantDetails.push({
              ...userData,
              isAdmin: chat.groupAdmins?.includes(participantId),
            });
          }
        }
        setParticipants(participantDetails);
      }
    } catch (error) {
      console.error('Load group info failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGroupPhoto = () => {
    Alert.alert(
      'Group Photo',
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
              });
              await updateGroupPhoto(image.path);
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
              });
              await updateGroupPhoto(image.path);
            } catch (error) {
              console.log('Gallery cancelled');
            }
          },
        },
        {
          text: 'Remove Photo',
          style: 'destructive',
          onPress: () => removeGroupPhoto(),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const updateGroupPhoto = async (uri) => {
    try {
      const photoURL = await chatService.uploadFile(
        uri,
        `groups/${chatId}/group_photo.jpg`
      );
      await chatService.updateGroupInfo(chatId, { icon: photoURL });
      setGroupData({ ...groupData, groupIcon: photoURL });
    } catch (error) {
      Alert.alert('Error', 'Failed to update group photo');
    }
  };

  const removeGroupPhoto = async () => {
    try {
      await chatService.updateGroupInfo(chatId, { icon: null });
      setGroupData({ ...groupData, groupIcon: null });
    } catch (error) {
      Alert.alert('Error', 'Failed to remove group photo');
    }
  };

  const handleSaveGroupName = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Group name cannot be empty');
      return;
    }

    try {
      await chatService.updateGroupInfo(chatId, { name: groupName });
      setGroupData({ ...groupData, groupName });
      setEditing(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update group name');
    }
  };

  const handleSaveDescription = async () => {
    try {
      await chatService.updateGroupInfo(chatId, { description: groupDescription });
      setGroupData({ ...groupData, groupDescription });
      setEditing(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update description');
    }
  };

  const handleAddParticipants = () => {
    navigation.navigate('ContactPicker', {
      mode: 'addParticipants',
      onContactsSelect: async (contacts) => {
        const participantIds = contacts.map(c => c.appUserId || c.id);
        try {
          await chatService.addGroupParticipants(chatId, participantIds);
          loadGroupInfo();
        } catch (error) {
          Alert.alert('Error', 'Failed to add participants');
        }
      },
    });
  };

  const handleRemoveParticipant = (participantId) => {
    Alert.alert(
      'Remove Participant',
      'Are you sure you want to remove this participant?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await chatService.removeGroupParticipant(chatId, participantId);
              loadGroupInfo();
            } catch (error) {
              Alert.alert('Error', 'Failed to remove participant');
            }
          },
        },
      ]
    );
  };

  const handleMakeAdmin = async (participantId) => {
    try {
      await chatService.makeGroupAdmin(chatId, participantId);
      loadGroupInfo();
    } catch (error) {
      Alert.alert('Error', 'Failed to make admin');
    }
  };

  const handleLeaveGroup = () => {
    Alert.alert(
      'Leave Group',
      'Are you sure you want to leave this group?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await chatService.leaveGroup(chatId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to leave group');
            }
          },
        },
      ]
    );
  };

  const renderParticipant = ({ item, index }) => (
    <Animatable.View animation="fadeInRight" duration={300} delay={index * 30}>
      <TouchableOpacity
        style={[styles.participantItem, { backgroundColor: theme.colors.card }]}
        onPress={() => {
          if (item.id !== user?.uid && isAdmin) {
            Alert.alert(
              item.displayName || 'Participant',
              'Choose an action',
              [
                ...(item.isAdmin
                  ? [
                      {
                        text: 'Remove as Admin',
                        onPress: () => chatService.removeGroupAdmin(chatId, item.id),
                      },
                    ]
                  : [
                      {
                        text: 'Make Admin',
                        onPress: () => handleMakeAdmin(item.id),
                      },
                    ]),
                {
                  text: 'Remove from Group',
                  style: 'destructive',
                  onPress: () => handleRemoveParticipant(item.id),
                },
                { text: 'Cancel', style: 'cancel' },
              ]
            );
          }
        }}
      >
        <Avatar
          uri={item.photoURL}
          name={item.displayName}
          size={50}
        />
        <View style={styles.participantInfo}>
          <Text style={[styles.participantName, { color: theme.colors.text }]}>
            {item.displayName || 'Unknown'}
            {item.id === user?.uid && ' (You)'}
          </Text>
          <Text style={[styles.participantRole, { color: theme.colors.textSecondary }]}>
            {item.isAdmin ? 'Group Admin' : 'Member'}
          </Text>
        </View>
        {item.isAdmin && (
          <Icon name="crown" size={20} color="#FFD700" />
        )}
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
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Group Info</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Group Photo and Name */}
        <Animatable.View animation="fadeInUp" delay={200} style={styles.groupHeader}>
          <TouchableOpacity onPress={isAdmin ? handleUpdateGroupPhoto : undefined}>
            <Avatar
              uri={groupData?.groupIcon}
              name={groupData?.groupName}
              size={100}
              isGroup
            />
            {isAdmin && (
              <View style={styles.cameraIcon}>
                <Icon name="camera" size={18} color="#fff" />
              </View>
            )}
          </TouchableOpacity>

          {editing ? (
            <View style={styles.editNameContainer}>
              <TextInput
                style={[styles.nameInput, { color: theme.colors.text }]}
                value={groupName}
                onChangeText={setGroupName}
                onSubmitEditing={handleSaveGroupName}
                autoFocus
              />
              <TouchableOpacity onPress={handleSaveGroupName}>
                <Icon name="check" size={24} color="#25D366" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => isAdmin && setEditing(true)}
              style={styles.nameContainer}
            >
              <Text style={[styles.groupName, { color: theme.colors.text }]}>
                {groupData?.groupName || 'Group'}
              </Text>
              {isAdmin && (
                <Icon name="pencil" size={16} color={theme.colors.textSecondary} />
              )}
            </TouchableOpacity>
          )}

          <Text style={[styles.groupInfo, { color: theme.colors.textSecondary }]}>
            Group · {participants.length} participants
          </Text>
        </Animatable.View>

        {/* Group Description */}
        <Animatable.View animation="fadeInUp" delay={300} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            Description
          </Text>
          {editing ? (
            <View style={[styles.editDescriptionContainer, { backgroundColor: theme.colors.card }]}>
              <TextInput
                style={[styles.descriptionInput, { color: theme.colors.text }]}
                value={groupDescription}
                onChangeText={setGroupDescription}
                onSubmitEditing={handleSaveDescription}
                multiline
                placeholder="Add group description"
                placeholderTextColor={theme.colors.textSecondary}
              />
              <TouchableOpacity onPress={handleSaveDescription}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => isAdmin && setEditing(true)}
              style={[styles.descriptionContainer, { backgroundColor: theme.colors.card }]}
            >
              <Text style={[styles.descriptionText, { color: theme.colors.text }]}>
                {groupData?.groupDescription || 'Add group description'}
              </Text>
              {isAdmin && (
                <Icon name="pencil" size={16} color={theme.colors.textSecondary} />
              )}
            </TouchableOpacity>
          )}
        </Animatable.View>

        {/* Media, Links, Docs */}
        <Animatable.View animation="fadeInUp" delay={400} style={styles.section}>
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: theme.colors.card }]}
            onPress={() => navigation.navigate('MediaPreview', { chatId })}
          >
            <Icon name="image-multiple" size={24} color={theme.colors.textSecondary} />
            <Text style={[styles.menuText, { color: theme.colors.text }]}>
              Media, Links, and Docs
            </Text>
            <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </Animatable.View>

        {/* Participants */}
        <Animatable.View animation="fadeInUp" delay={500} style={styles.section}>
          <View style={styles.participantsHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
              Participants ({participants.length})
            </Text>
            {isAdmin && (
              <TouchableOpacity onPress={handleAddParticipants}>
                <Icon name="account-plus" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {participants.map((participant, index) => (
            <React.Fragment key={participant.id}>
              {renderParticipant({ item: participant, index })}
            </React.Fragment>
          ))}

          {isAdmin && (
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
          )}
        </Animatable.View>

        {/* Actions */}
        <Animatable.View animation="fadeInUp" delay={600} style={styles.section}>
          <TouchableOpacity
            style={[styles.dangerButton, { backgroundColor: theme.colors.card }]}
            onPress={handleLeaveGroup}
          >
            <Icon name="exit-to-app" size={24} color="#FF3B30" />
            <Text style={styles.dangerText}>Leave Group</Text>
          </TouchableOpacity>
        </Animatable.View>
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
  groupHeader: {
    alignItems: 'center',
    padding: 20,
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
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    gap: 8,
  },
  groupName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  groupInfo: {
    fontSize: 14,
    marginTop: 5,
  },
  editNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    gap: 10,
  },
  nameInput: {
    fontSize: 22,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#25D366',
    flex: 1,
    textAlign: 'center',
  },
  section: {
    marginTop: 20,
    marginHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  descriptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    gap: 8,
  },
  descriptionText: {
    flex: 1,
    fontSize: 16,
  },
  editDescriptionContainer: {
    padding: 15,
    borderRadius: 12,
  },
  descriptionInput: {
    fontSize: 16,
    minHeight: 60,
    marginBottom: 10,
  },
  saveText: {
    color: '#25D366',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    gap: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
  },
  participantsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  participantInfo: {
    flex: 1,
    marginLeft: 15,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  participantRole: {
    fontSize: 13,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginTop: 10,
    borderRadius: 12,
  },
  addIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  addText: {
    fontSize: 16,
    fontWeight: '500',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    gap: 12,
  },
  dangerText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GroupInfoScreen;
