import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';
import { useTheme } from '../../config/theme';

const PollMessage = ({ poll, isMine, onVote }) => {
  const { theme } = useTheme();
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);

  const handleVote = (optionIndex) => {
    if (hasVoted && !poll.allowMultipleAnswers) return;

    let newSelected;
    if (poll.allowMultipleAnswers) {
      if (selectedOptions.includes(optionIndex)) {
        newSelected = selectedOptions.filter(i => i !== optionIndex);
      } else {
        newSelected = [...selectedOptions, optionIndex];
      }
    } else {
      newSelected = [optionIndex];
      setHasVoted(true);
    }

    setSelectedOptions(newSelected);
    onVote?.(poll.id, newSelected);
  };

  const getPercentage = (optionIndex) => {
    if (poll.totalVotes === 0) return 0;
    const votes = poll.votes[optionIndex] || 0;
    return Math.round((votes / poll.totalVotes) * 100);
  };

  const getTotalVotes = () => {
    return poll.totalVotes || 0;
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isMine ? '#E8F5E8' : theme.colors.surface },
      ]}
    >
      {/* Question */}
      <View style={styles.header}>
        <Icon name="poll" size={20} color="#25D366" />
        <Text style={[styles.question, { color: theme.colors.text }]}>
          {poll.question}
        </Text>
      </View>

      {/* Options */}
      <View style={styles.options}>
        {poll.options.map((option, index) => {
          const percentage = getPercentage(index);
          const isSelected = selectedOptions.includes(index);

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.option,
                { backgroundColor: theme.colors.background },
                isSelected && styles.selectedOption,
              ]}
              onPress={() => handleVote(index)}
              activeOpacity={0.7}
            >
              <View style={styles.optionContent}>
                {hasVoted && (
                  <View style={styles.percentageBar}>
                    <Animatable.View
                      animation="slideInLeft"
                      duration={1000}
                      style={[
                        styles.percentageFill,
                        { width: `${percentage}%`, backgroundColor: '#25D366' },
                      ]}
                    />
                  </View>
                )}
                
                <View style={styles.optionRow}>
                  <Text
                    style={[
                      styles.optionText,
                      { color: theme.colors.text },
                      isSelected && styles.selectedOptionText,
                    ]}
                  >
                    {option}
                  </Text>
                  
                  {hasVoted && (
                    <Text style={[styles.percentage, { color: theme.colors.textSecondary }]}>
                      {percentage}%
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.voteCount, { color: theme.colors.textSecondary }]}>
          {getTotalVotes()} vote{getTotalVotes() !== 1 ? 's' : ''}
        </Text>
        {poll.allowMultipleAnswers && (
          <Text style={[styles.multipleText, { color: theme.colors.textSecondary }]}>
            Multiple answers allowed
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 12,
    minWidth: 250,
    maxWidth: 320,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  options: {
    gap: 8,
  },
  option: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  selectedOption: {
    borderWidth: 2,
    borderColor: '#25D366',
  },
  optionContent: {
    position: 'relative',
  },
  percentageBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: 'rgba(37, 211, 102, 0.1)',
  },
  percentageFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    opacity: 0.2,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  optionText: {
    fontSize: 15,
    flex: 1,
  },
  selectedOptionText: {
    fontWeight: '600',
    color: '#25D366',
  },
  percentage: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: '#E0E0E0',
  },
  voteCount: {
    fontSize: 12,
  },
  multipleText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
});

export default PollMessage;
