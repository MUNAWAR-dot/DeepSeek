import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';

class NetworkManager {
  constructor() {
    this.isConnected = true;
    this.connectionType = null;
    this.listeners = new Set();
    this.unsubscribe = null;
  }

  initialize() {
    this.unsubscribe = NetInfo.addEventListener((state) => {
      const prevConnected = this.isConnected;
      this.isConnected = state.isConnected && state.isInternetReachable !== false;
      this.connectionType = state.type;

      if (prevConnected !== this.isConnected) {
        this.notifyListeners();
      }
    });
  }

  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners() {
    this.listeners.forEach((callback) => {
      callback({
        isConnected: this.isConnected,
        connectionType: this.connectionType,
      });
    });
  }

  getConnectionInfo() {
    return {
      isConnected: this.isConnected,
      connectionType: this.connectionType,
    };
  }

  isWifi() {
    return this.connectionType === 'wifi';
  }

  isCellular() {
    return this.connectionType === 'cellular';
  }

  shouldDownloadLargeFiles() {
    return this.isConnected && (this.isWifi() || Platform.OS === 'ios');
  }

  async checkConnection() {
    const state = await NetInfo.fetch();
    return state.isConnected && state.isInternetReachable !== false;
  }

  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    this.listeners.clear();
  }
}

export default new NetworkManager();
