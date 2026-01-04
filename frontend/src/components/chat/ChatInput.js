import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ChatInput = ({ 
  onSend, 
  placeholder = 'Type your message...', 
  disabled = false,
  maxLength = 500,
  autoFocus = false,
}) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim() === '' || disabled) return;
    onSend(text.trim());
    setText('');
  };

  const handleChangeText = (value) => {
    if (value.length <= maxLength) {
      setText(value);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.container}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor="#9ca3af"
            value={text}
            onChangeText={handleChangeText}
            multiline
            maxLength={maxLength}
            editable={!disabled}
            autoFocus={autoFocus}
            returnKeyType="send"
            blurOnSubmit={false}
            onSubmitEditing={handleSend}
          />
          
          {/* Character counter */}
          {text.length > maxLength * 0.8 && (
            <View style={styles.counterBadge}>
              <Ionicons 
                name="warning" 
                size={12} 
                color={text.length >= maxLength ? '#ef4444' : '#f59e0b'} 
              />
            </View>
          )}

          {/* Send Button */}
          <TouchableOpacity
            style={[
              styles.sendButton,
              (text.trim() === '' || disabled) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={text.trim() === '' || disabled}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={(text.trim() === '' || disabled) ? '#d1d5db' : '#fff'} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 16 : 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    position: 'relative',
  },
  input: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingRight: 50,
    fontSize: 15,
    color: '#1f2937',
    maxHeight: 100,
    minHeight: 40,
  },
  counterBadge: {
    position: 'absolute',
    right: 48,
    bottom: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 4,
  },
  sendButton: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: '#e5e7eb',
    shadowOpacity: 0,
  },
});

export default ChatInput;
