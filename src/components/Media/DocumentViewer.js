import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import { formatFileSize } from '../../utils/helpers';
import { useTheme } from '../../config/theme';

const DocumentViewer = ({ documentUrl, fileName, fileSize, isMine }) => {
  const { theme } = useTheme();
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const getFileIcon = () => {
    const extension = fileName?.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return { name: 'file-pdf-box', color: '#FF3B30' };
      case 'doc':
      case 'docx':
        return { name: 'file-word', color: '#2196F3' };
      case 'xls':
      case 'xlsx':
        return { name: 'file-excel', color: '#4CAF50' };
      case 'ppt':
      case 'pptx':
        return { name: 'file-powerpoint', color: '#FF9800' };
      case 'zip':
      case 'rar':
        return { name: 'folder-zip', color: '#9C27B0' };
      case 'txt':
        return { name: 'file-document', color: '#607D8B' };
      default:
        return { name: 'file', color: '#757575' };
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const fileName_with_ext = fileName || `document_${Date.now()}`;
      const downloadDest = `${RNFS.CachesDirectoryPath}/${fileName_with_ext}`;

      const download = RNFS.downloadFile({
        fromUrl: documentUrl,
        toFile: downloadDest,
        progress: (res) => {
          const progress = (res.bytesWritten / res.contentLength) * 100;
          setDownloadProgress(progress);
        },
      });

      const result = await download.promise;
      
      if (result.statusCode === 200) {
        await handleOpenFile(downloadDest);
      } else {
        Alert.alert('Error', 'Failed to download file');
      }
    } catch (error) {
      console.error('Download failed:', error);
      Alert.alert('Error', 'Failed to download file');
    } finally {
      setDownloading(false);
      setDownloadProgress(0);
    }
  };

  const handleOpenFile = async (filePath) => {
    try {
      await FileViewer.open(filePath);
    } catch (error) {
      Alert.alert('Error', 'No application available to open this file');
    }
  };

  const handleShare = async () => {
    try {
      const Share = require('react-native-share').default;
      await Share.open({
        url: documentUrl,
        type: 'application/octet-stream',
        filename: fileName,
        title: 'Share Document',
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const fileIcon = getFileIcon();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: isMine ? 'rgba(7, 94, 84, 0.1)' : theme.colors.surface },
      ]}
      onPress={handleDownload}
      disabled={downloading}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Icon name={fileIcon.name} size={35} color={fileIcon.color} />
      </View>

      <View style={styles.fileInfo}>
        <Text
          style={[styles.fileName, { color: theme.colors.text }]}
          numberOfLines={1}
        >
          {fileName || 'Document'}
        </Text>
        <Text style={[styles.fileSize, { color: theme.colors.textSecondary }]}>
          {fileSize ? formatFileSize(fileSize) : 'Unknown size'}
        </Text>
        {downloading && (
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${downloadProgress}%`, backgroundColor: fileIcon.color },
              ]}
            />
          </View>
        )}
      </View>

      <View style={styles.actions}>
        {downloading ? (
          <ActivityIndicator size="small" color={fileIcon.color} />
        ) : (
          <>
            <TouchableOpacity onPress={handleDownload} style={styles.actionButton}>
              <Icon name="download" size={22} color={fileIcon.color} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
              <Icon name="share-variant" size={22} color="#667781" />
            </TouchableOpacity>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    minWidth: 250,
    gap: 12,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 12,
  },
  progressBar: {
    height: 3,
    backgroundColor: '#E0E0E0',
    borderRadius: 1.5,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 5,
  },
});

export default DocumentViewer;
