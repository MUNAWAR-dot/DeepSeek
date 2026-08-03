import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';
import useStore from '../../store/store';
import { useTheme } from '../../config/theme';

const fontSizeOptions = [
  {
    size: 'small',
    label: 'Small',
    previewSize: 14,
    description: 'Compact text for more content on screen',
  },
  {
    size: 'medium',
    label: 'Medium',
    previewSize: 16,
    description: 'Default text size (Recommended)',
  },
  {
    size: 'large',
    label: 'Large',
    previewSize: 18,
    description: 'Larger text for better readability',
  },
  {
    size: 'extraLarge',
    label: 'Extra Large',
    previewSize: 20,
    description: 'Maximum text size for easy reading',
  },
];

const FontSizeScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { fontSize, setFontSize } = useStore();
  const [selected, setSelected] = useState(fontSize || 'medium');

  const handleSelect = (size) => {
    setSelected(size);
    setFontSize(size);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Font Size
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Animatable.View animation="fadeInUp" delay={200} style={styles.content}>
          {fontSizeOptions.map((option, index) => (
            <TouchableOpacity
              key={option.size}
              style={[
                styles.option,
                { backgroundColor: theme.colors.card },
                selected === option.size && styles.selectedOption,
              ]}
              onPress={() => handleSelect(option.size)}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionHeader}>
                  <Text style={[styles.optionLabel, { color: theme.colors.text }]}>
                    {option.label}
                  </Text>
                  {selected === option.size && (
                    <Icon name="check" size={22} color="#25D366" />
                  )}
                </View>
                <Text style={[styles.optionDescription, { color: theme.colors.textSecondary }]}>
                  {option.description}
                </Text>
                <View style={[styles.previewContainer, { backgroundColor: theme.colors.background }]}>
                  <Text
                    style={[
                      styles.previewText,
                      { fontSize: option.previewSize, color: theme.colors.text },
                    ]}
                  >
                    This is how your messages will look with {option.label.toLowerCase()} font size.
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
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
  content: {
    padding: 20,
    gap: 15,
  },
  option: {
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  selectedOption: {
    borderColor: '#25D366',
  },
  optionContent: {
    padding: 20,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  previewContainer: {
    padding: 15,
    borderRadius: 10,
  },
  previewText: {
    lineHeight: 24,
  },
});

export default FontSizeScreen;
