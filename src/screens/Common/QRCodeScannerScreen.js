import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import { useTheme } from '../../config/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const QRCodeScannerScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [flashOn, setFlashOn] = useState(false);
  const [scanned, setScanned] = useState(false);
  const scannerRef = useRef(null);

  const handleScan = (e) => {
    if (scanned) return;
    
    setScanned(true);
    
    try {
      const data = JSON.parse(e.data);
      
      if (data.type === 'contact') {
        // Add contact or start chat
        Alert.alert(
          'Contact Found',
          `Add ${data.name || 'this user'} to your contacts?`,
          [
            { text: 'Cancel', style: 'cancel', onPress: () => setScanned(false) },
            {
              text: 'Add',
              onPress: () => {
                navigation.navigate('ChatRoom', {
                  chatId: data.userId,
                  chatName: data.name,
                });
              },
            },
          ]
        );
      } else {
        Alert.alert(
          'QR Code Scanned',
          `Content: ${e.data}`,
          [{ text: 'OK', onPress: () => setScanned(false) }]
        );
      }
    } catch (error) {
      Alert.alert(
        'QR Code Scanned',
        `Content: ${e.data}`,
        [{ text: 'OK', onPress: () => setScanned(false) }]
      );
    }
  };

  const handleFlash = () => {
    setFlashOn(!flashOn);
  };

  const handleRescan = () => {
    setScanned(false);
    scannerRef.current?.reactivate();
  };

  const renderTopContent = () => (
    <View style={styles.topContent}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
        <Icon name="close" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const renderBottomContent = () => (
    <View style={styles.bottomContent}>
      <Text style={styles.instructionText}>
        Point your camera at a QR code to scan
      </Text>
      
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleFlash}>
          <Icon
            name={flashOn ? 'flashlight' : 'flashlight-off'}
            size={24}
            color="#fff"
          />
          <Text style={styles.actionText}>Flash</Text>
        </TouchableOpacity>

        {scanned && (
          <TouchableOpacity style={styles.actionButton} onPress={handleRescan}>
            <Icon name="refresh" size={24} color="#fff" />
            <Text style={styles.actionText}>Scan Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <QRCodeScanner
        ref={scannerRef}
        onRead={handleScan}
        flashMode={
          flashOn
            ? RNCamera.Constants.FlashMode.torch
            : RNCamera.Constants.FlashMode.off
        }
        topContent={renderTopContent()}
        bottomContent={renderBottomContent()}
        cameraStyle={styles.camera}
        containerStyle={styles.cameraContainer}
        topViewStyle={styles.topView}
        bottomViewStyle={styles.bottomView}
        showMarker
        markerStyle={styles.marker}
        customMarker={
          <View style={styles.customMarker}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            
            {scanned && (
              <Animatable.View animation="bounceIn" style={styles.scanComplete}>
                <Icon name="check-circle" size={60} color="#25D366" />
              </Animatable.View>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  topView: {
    flex: 0,
    backgroundColor: 'transparent',
  },
  bottomView: {
    flex: 0,
    backgroundColor: 'transparent',
  },
  topContent: {
    padding: 20,
    paddingTop: 10,
  },
  closeButton: {
    padding: 8,
  },
  bottomContent: {
    padding: 30,
    alignItems: 'center',
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
  },
  actionButton: {
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
  },
  marker: {
    borderColor: 'transparent',
  },
  customMarker: {
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#fff',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  scanComplete: {
    position: 'absolute',
  },
});

export default QRCodeScannerScreen;
