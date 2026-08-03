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
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../config/theme';

const PollCreateScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { onPollCreate } = route.params || {};

  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [allowMultipleAnswers, setAllowMultipleAnswers] = useState(false);

  const addOption = () => {
    if (options.length >= 10) {
      Alert.alert('Limit', 'Maximum 10 options allowed');
      return;
    }
    setOptions([...options, '']);
  };

  const removeOption = (index) => {
    if (options.length <= 2) {
      Alert.alert('Required', 'Minimum 2 options required');
      return;
    }
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  const updateOption = (text, index) => {
    const newOptions = [...options];
    newOptions[index] = text;
    setOptions(newOptions);
  };

  const handleCreate = () => {
    if (!question.trim()) {
      Alert.alert('Error', 'Please enter a question');
      return;
    }

    const validOptions = options.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      Alert.alert('Error', 'Please add at least 2 options');
      return;
    }

    const pollData = {
      question: question.trim(),
      options: validOptions.map(opt => opt.trim()),
      allowMultipleAnswers,
      totalVotes: 0,
      votes: {},
      createdAt: new Date().toISOString(),
    };

    if (onPollCreate) {
      onPollCreate(pollData);
      navigation.goBack();
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
          Create Poll
        </Text>
        <TouchableOpacity onPress={handleCreate}>
          <Text style={[styles.createButton, { color: question.trim() ? '#25D366' : '#BDBDBD' }]}>
            Create
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Animatable.View animation="fadeInUp" delay={200} style={styles.content}>
          {/* Question Input */}
          <View style={[styles.questionContainer, { backgroundColor: theme.colors.card }]}>
            <TextInput
              style={[styles.questionInput, { color: theme.colors.text }]}
              placeholder="Ask a question..."
              placeholderTextColor={theme.colors.textSecondary}
              value={question}
              onChangeText={setQuestion}
              multiline
              maxLength={500}
            />
            <Text style={[styles.charCount, { color: theme.colors.textSecondary }]}>
              {question.length}/500
            </Text>
          </View>

          {/* Options */}
          <View style={styles.optionsSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
              Options
            </Text>
            
            {options.map((option, index) => (
              <Animatable.View
                key={index}
                animation="fadeInRight"
                delay={index * 50}
                style={[styles.optionContainer, { backgroundColor: theme.colors.card }]}
              >
                <View style={styles.optionNumber}>
                  <Text style={[styles.optionNumberText, { color: theme.colors.textSecondary }]}>
                    {index + 1}
                  </Text>
                </View>
                
                <TextInput
                  style={[styles.optionInput, { color: theme.colors.text }]}
                  placeholder={`Option ${index + 1}`}
                  placeholderTextColor={theme.colors.textSecondary}
                  value={option}
                  onChangeText={(text) => updateOption(text, index)}
                  maxLength={200}
                />
                
                <TouchableOpacity
                  onPress={() => removeOption(index)}
                  style={styles.removeButton}
                >
                  <Icon name="close-circle" size={22} color="#FF3B30" />
                </TouchableOpacity>
              </Animatable.View>
            ))}

            <TouchableOpacity
              style={[styles.addOptionButton, { borderColor: theme.colors.border }]}
              onPress={addOption}
            >
              <Icon name="plus-circle" size={24} color="#25D366" />
              <Text style={[styles.addOptionText, { color: '#25D366' }]}>
                Add Option
              </Text>
            </TouchableOpacity>
          </View>

          {/* Settings */}
          <View style={[styles.settingsSection, { backgroundColor: theme.colors.card }]}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                  Allow multiple answers
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                  Voters can select multiple options
                </Text>
              </View>
              <Switch
                value={allowMultipleAnswers}
                onValueChange={setAllowMultipleAnswers}
                trackColor={{ false: '#D1D1D6', true: '#34C759' }}
                thumbColor="#fff"
              />
            </View>
          </View>
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
  createButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  questionContainer: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  questionInput: {
    fontSize: 18,
    fontWeight: '500',
    minHeight: 60,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
  },
  optionsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 8,
    padding: 8,
    gap: 10,
  },
  optionNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionNumberText: {
    fontSize: 14,
    fontWeight: '600',
  },
  optionInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  removeButton: {
    padding: 5,
  },
  addOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    gap: 8,
  },
  addOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingsSection: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
  },
});

export default PollCreateScreen;
