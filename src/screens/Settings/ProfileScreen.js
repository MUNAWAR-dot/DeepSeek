import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';
import ImagePicker from 'react-native-image-crop-picker';
import useStore from '../../store/store';
import Avatar from '../../components/Common/Avatar';
import userService from '../../services/userService';
import { useTheme } from '../../config/theme';

const ProfileScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { user, updateUserProfile } = useStore();
  
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [status, setStatus] = useState(user?.status || 'Hey there! I am using ChatsApp');
  const [about, setAbout] = useState(user?.about || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState({
    name: false,
    status: false,
    about: false,
  });

  const handleUpdatePhoto = () => {
    Alert.alert(
      'Profile Photo',
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
              await uploadPhoto(image.path);
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
              await uploadPhoto(image.path);
            } catch (error) {
              console.log('Gallery cancelled');
            }
          },
        },
        {
          text: 'Remove Photo',
          style: 'destructive',
          onPress: () => handleRemovePhoto(),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const uploadPhoto = async (uri) => {
    try {
      setLoading(true);
      const photoURL = await userService.updateProfilePhoto(user.uid, uri);
      updateUserProfile({ photoURL });
      Alert.alert('Success', 'Profile photo updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile photo');
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      setLoading(true);
      await userService.updateProfile(user.uid, { photoURL: null });
      updateUserProfile({ photoURL: null });
      Alert.alert('Success', 'Profile photo removed');
    } catch (error) {
      Alert.alert('Error', 'Failed to remove profile photo');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveName = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    try {
      setLoading(true);
      await userService.updateProfile(user.uid, {
        displayName,
        displayNameLower: displayName.toLowerCase(),
      });
      updateUserProfile({ displayName });
      setEditing({ ...editing, name: false });
      Alert.alert('Success', 'Name updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to update name');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStatus = async () => {
    try {
      setLoading(true);
      await userService.updateProfile(user.uid, { status });
      updateUserProfile({ status });
      setEditing({ ...editing, status: false });
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAbout = async () => {
    try {
      setLoading(true);
      await userService.updateProfile(user.uid, { about });
      updateUserProfile({ about });
      setEditing({ ...editing, about: false });
    } catch (error) {
      Alert.alert('Error', 'Failed to update about');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Animatable.View animation="fadeInUp" delay={200} style={styles.photoSection}>
          <TouchableOpacity onPress={handleUpdatePhoto}>
            <Avatar
              uri={user?.photoURL}
              name={user?.displayName}
              size={100}
            />
            <View style={styles.cameraIcon}>
              <Icon name="camera" size={20} color="#fff" />
            </View>
          </TouchableOpacity>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={300} style={styles.infoSection}>
          {/* Name */}
          <TouchableOpacity
            style={[styles.infoItem, { backgroundColor: theme.colors.card }]}
            onPress={() => setEditing({ ...editing, name: true })}
          >
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Name</Text>
            {editing.name ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={[styles.editInput, { color: theme.colors.text }]}
                  value={displayName}
                  onChangeText={setDisplayName}
                  autoFocus
                  onBlur={handleSaveName}
                  onSubmitEditing={handleSaveName}
                />
                <TouchableOpacity onPress={handleSaveName}>
                  <Icon name="check" size={24} color="#25D366" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.infoValue}>
                <Text style={[styles.infoValueText, { color: theme.colors.text }]}>
                  {displayName || 'Set your name'}
                </Text>
                <Icon name="pencil" size={18} color={theme.colors.textSecondary} />
              </View>
            )}
          </TouchableOpacity>

          {/* Status */}
          <TouchableOpacity
            style={[styles.infoItem, { backgroundColor: theme.colors.card }]}
            onPress={() => setEditing({ ...editing, status: true })}
          >
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Status</Text>
            {editing.status ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={[styles.editInput, { color: theme.colors.text }]}
                  value={status}
                  onChangeText={setStatus}
                  autoFocus
                  maxLength={139}
                  onBlur={handleSaveStatus}
                  onSubmitEditing={handleSaveStatus}
                />
                <TouchableOpacity onPress={handleSaveStatus}>
                  <Icon name="check" size={24} color="#25D366" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.infoValue}>
                <Text style={[styles.infoValueText, { color: theme.colors.text }]}>
                  {status || 'Set your status'}
                </Text>
                <Icon name="pencil" size={18} color={theme.colors.textSecondary} />
              </View>
            )}
          </TouchableOpacity>

          {/* About */}
          <TouchableOpacity
            style={[styles.infoItem, { backgroundColor: theme.colors.card }]}
            onPress={() => setEditing({ ...editing, about: true })}
          >
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>About</Text>
            {editing.about ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={[styles.editInput, { color: theme.colors.text }]}
                  value={about}
                  onChangeText={setAbout}
                  autoFocus
                  maxLength={139}
                  onBlur={handleSaveAbout}
                  onSubmitEditing={handleSaveAbout}
                />
                <TouchableOpacity onPress={handleSaveAbout}>
                  <Icon name="check" size={24} color="#25D366" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.infoValue}>
                <Text style={[styles.infoValueText, { color: theme.colors.text }]}>
                  {about || 'Add an about'}
                </Text>
                <Icon name="pencil" size={18} color={theme.colors.textSecondary} />
              </View>
            )}
          </TouchableOpacity>

          {/* Phone */}
          <View style={[styles.infoItem, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Phone</Text>
            <View style={styles.infoValue}>
              <Text style={[styles.infoValueText, { color: theme.colors.text }]}>
                {phoneNumber || 'Not set'}
              </Text>
            </View>
          </View>

          {/* Email */}
          <View style={[styles.infoItem, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Email</Text>
            <View style={styles.infoValue}>
              <Text style={[styles.infoValueText, { color: theme.colors.text }]}>
                {email || 'Not set'}
              </Text>
            </View>
          </View>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={400} style={styles.qrSection}>
          <TouchableOpacity
            style={[styles.qrButton, { backgroundColor: theme.colors.card }]}
            onPress={() => navigation.navigate('QRCodeScanner')}
          >
            <Icon name="qrcode" size={24} color={theme.colors.text} />
            <Text style={[styles.qrText, { color: theme.colors.text }]}>
              Share your QR code
            </Text>
            <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
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
  photoSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#25D366',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  infoSection: {
    marginHorizontal: 15,
    borderRadius: 12,
    overflow: 'hidden',
  },
  infoItem: {
    padding: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  infoLabel: {
    fontSize: 13,
    marginBottom: 5,
  },
  infoValue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoValueText: {
    fontSize: 16,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  editInput: {
    flex: 1,
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#25D366',
    paddingVertical: 5,
  },
  qrSection: {
    marginHorizontal: 15,
    marginTop: 20,
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    gap: 12,
  },
  qrText: {
    flex: 1,
    fontSize: 16,
  },
});

export default ProfileScreen;
