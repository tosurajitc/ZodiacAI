import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const ChatScreen = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Hello! I\'m your AI astrology assistant. Ask me anything about your career, relationships, health, or life predictions based on your birth chart.',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [questionsRemaining, setQuestionsRemaining] = useState(5);
  const scrollViewRef = useRef();

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim() === '') return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response (in real app, this would call backend API)
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        role: 'assistant',
        content: generateMockResponse(inputText),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
      setQuestionsRemaining((prev) => Math.max(0, prev - 1));
    }, 2000);
  };

  const generateMockResponse = (question) => {
    const responses = [
      'Based on your birth chart, Jupiter is currently transiting through your 10th house of career. This is an excellent time for professional growth and new opportunities. Consider taking on leadership roles.',
      'Your Saturn dasha is currently active, which suggests a period of hard work and discipline. The results may take time, but they will be long-lasting and rewarding.',
      'The current planetary positions indicate favorable conditions for relationships. Venus is strong in your 7th house, suggesting harmony in partnerships.',
      'According to your chart, you have a strong Raj Yoga forming between Jupiter and Moon. This indicates success in endeavors that involve creativity and communication.',
      'Your health sector shows good vitality. However, pay attention to stress management during the upcoming Mars transit in your 6th house.',
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const quickQuestions = [
    'When should I change my job?',
    'Is this a good time for marriage?',
    'How is my financial situation?',
    'What about my health?',
  ];

  const handleQuickQuestion = (question) => {
    setInputText(question);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={90}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>AI Astrologer</Text>
            <Text style={styles.headerSubtitle}>Powered by Vedic Wisdom</Text>
          </View>
          <View style={styles.questionsCounter}>
            <Ionicons name="chatbubble-ellipses" size={16} color="#fff" />
            <Text style={styles.questionsText}>{questionsRemaining} left today</Text>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageWrapper,
                message.role === 'user' ? styles.userMessageWrapper : styles.assistantMessageWrapper,
              ]}
            >
              {message.role === 'assistant' && (
                <View style={styles.avatarContainer}>
                  <LinearGradient colors={['#667eea', '#764ba2']} style={styles.avatar}>
                    <Ionicons name="sparkles" size={16} color="#fff" />
                  </LinearGradient>
                </View>
              )}
              <View
                style={[
                  styles.messageBubble,
                  message.role === 'user' ? styles.userBubble : styles.assistantBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.role === 'user' ? styles.userText : styles.assistantText,
                  ]}
                >
                  {message.content}
                </Text>
                <Text
                  style={[
                    styles.timestamp,
                    message.role === 'user' ? styles.userTimestamp : styles.assistantTimestamp,
                  ]}
                >
                  {formatTime(message.timestamp)}
                </Text>
              </View>
            </View>
          ))}

          {isTyping && (
            <View style={[styles.messageWrapper, styles.assistantMessageWrapper]}>
              <View style={styles.avatarContainer}>
                <LinearGradient colors={['#667eea', '#764ba2']} style={styles.avatar}>
                  <Ionicons name="sparkles" size={16} color="#fff" />
                </LinearGradient>
              </View>
              <View style={[styles.messageBubble, styles.assistantBubble, styles.typingBubble]}>
                <View style={styles.typingIndicator}>
                  <View style={styles.typingDot} />
                  <View style={styles.typingDot} />
                  <View style={styles.typingDot} />
                </View>
              </View>
            </View>
          )}

          {/* Quick Questions */}
          {messages.length <= 2 && (
            <View style={styles.quickQuestionsContainer}>
              <Text style={styles.quickQuestionsTitle}>Quick questions:</Text>
              {quickQuestions.map((question, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickQuestionButton}
                  onPress={() => handleQuickQuestion(question)}
                >
                  <Text style={styles.quickQuestionText}>{question}</Text>
                  <Ionicons name="arrow-forward" size={16} color="#667eea" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Ask about your future..."
              placeholderTextColor="#9ca3af"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, inputText.trim() === '' && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={inputText.trim() === '' || questionsRemaining === 0}
            >
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          {questionsRemaining === 0 && (
            <View style={styles.limitWarning}>
              <Ionicons name="alert-circle" size={16} color="#ef4444" />
              <Text style={styles.limitWarningText}>Daily limit reached. Upgrade to Premium for unlimited questions!</Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#e0e7ff',
    marginTop: 2,
  },
  questionsCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  questionsText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  messagesContent: {
    paddingVertical: 16,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  userMessageWrapper: {
    justifyContent: 'flex-end',
  },
  assistantMessageWrapper: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginRight: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#667eea',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },
  userText: {
    color: '#fff',
  },
  assistantText: {
    color: '#1f2937',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
  },
  userTimestamp: {
    color: '#e0e7ff',
    textAlign: 'right',
  },
  assistantTimestamp: {
    color: '#9ca3af',
  },
  typingBubble: {
    paddingVertical: 16,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9ca3af',
    marginHorizontal: 2,
  },
  quickQuestionsContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  quickQuestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 12,
  },
  quickQuestionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  quickQuestionText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  inputContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
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
  },
  sendButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  limitWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  limitWarningText: {
    flex: 1,
    fontSize: 12,
    color: '#991b1b',
    marginLeft: 8,
    lineHeight: 16,
  },
});

export default ChatScreen;
