// frontend/src/components/BirthDetailsModal.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, ScrollView, Alert, Platform, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Only import DateTimePicker for mobile platforms
let DateTimePicker = null;
if (Platform.OS !== 'web') {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export default function BirthDetailsModal({ 
  visible, 
  onClose, 
  onConfirm,
  purpose = 'horoscope' // 'horoscope' or 'kundli'
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState(new Date());
  const [birthTime, setBirthTime] = useState(new Date());
  const [birthLocation, setBirthLocation] = useState('');
  const [gender, setGender] = useState('');
  
  // Web-specific string inputs for date/time
  const [webDateString, setWebDateString] = useState('');
  const [webTimeString, setWebTimeString] = useState('');
  
  // Date/Time picker visibility (mobile only)
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Validation errors
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (visible) {
      fetchBirthDetails();
    }
  }, [visible]);

  useEffect(() => {
    // Sync web inputs with date objects
    if (Platform.OS === 'web') {
      setWebDateString(birthDate.toISOString().split('T')[0]); // YYYY-MM-DD
      setWebTimeString(birthTime.toTimeString().substring(0, 5)); // HH:MM
    }
  }, [birthDate, birthTime]);

  const fetchBirthDetails = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('@astroai_auth_token');
      
      const response = await fetch(`${API_BASE_URL}/api/kundli`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const birthDetails = data.data.birthDetails;
          // Pre-fill existing data
          setName(birthDetails?.name || '');
          setBirthLocation(birthDetails?.birth_location || '');
          setGender(birthDetails?.gender || '');
          
          if (birthDetails?.birth_date) {
            const date = new Date(birthDetails.birth_date);
            setBirthDate(date);
            if (Platform.OS === 'web') {
              setWebDateString(date.toISOString().split('T')[0]);
            }
          }
          if (birthDetails?.birth_time) {
            const [hours, minutes] = birthDetails.birth_time.split(':');
            const timeDate = new Date();
            timeDate.setHours(parseInt(hours), parseInt(minutes));
            setBirthTime(timeDate);
            if (Platform.OS === 'web') {
              setWebTimeString(birthDetails.birth_time.substring(0, 5));
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching birth details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWebDateChange = (dateString) => {
    setWebDateString(dateString);
    if (dateString) {
      setBirthDate(new Date(dateString));
    }
  };

  const handleWebTimeChange = (timeString) => {
    setWebTimeString(timeString);
    if (timeString) {
      const [hours, minutes] = timeString.split(':');
      const timeDate = new Date();
      timeDate.setHours(parseInt(hours), parseInt(minutes));
      setBirthTime(timeDate);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!birthLocation.trim()) {
      newErrors.birthLocation = 'Birth place is required';
    }
    if (!gender) {
      newErrors.gender = 'Gender is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill all required fields');
      return;
    }

    try {
      setSaving(true);
      
      const birthDetailsData = {
        name: name.trim(),
        dateOfBirth: birthDate.toISOString().split('T')[0], // YYYY-MM-DD
        timeOfBirth: birthTime.toTimeString().split(' ')[0].substring(0, 5), // HH:MM
        placeOfBirth: birthLocation.trim(),
        gender: gender,
        timezone: 5.5
      };

      // Pass data to parent component - parent handles API call
      if (onConfirm) {
        await onConfirm(birthDetailsData);
      }
      
      onClose();
    } catch (error) {
      console.error('Error in handleConfirm:', error);
      Alert.alert('Error', 'Failed to process birth details. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-GB'); // DD/MM/YYYY
  };

  const formatTime = (time) => {
    return time.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Render date input based on platform
  const renderDateInput = () => {
    if (Platform.OS === 'web') {
      return (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Birth Date *</Text>
          <input
            type="date"
            value={webDateString}
            onChange={(e) => handleWebDateChange(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            style={{
              width: '100%',
              padding: '14px 12px',
              fontSize: '16px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              outline: 'none',
              fontFamily: 'inherit',
              backgroundColor: '#fff',
            }}
          />
        </View>
      );
    }

    // Mobile date picker
    return (
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Birth Date *</Text>
        <Button
          mode="outlined"
          onPress={() => setShowDatePicker(true)}
          style={styles.dateButton}
          icon="calendar"
          contentStyle={styles.dateButtonContent}
        >
          {formatDate(birthDate)}
        </Button>
        {showDatePicker && DateTimePicker && (
          <DateTimePicker
            value={birthDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (selectedDate) {
                setBirthDate(selectedDate);
              }
            }}
            maximumDate={new Date()}
          />
        )}
      </View>
    );
  };

  // Render time input based on platform
  const renderTimeInput = () => {
    if (Platform.OS === 'web') {
      return (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Birth Time *</Text>
          <input
            type="time"
            value={webTimeString}
            onChange={(e) => handleWebTimeChange(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 12px',
              fontSize: '16px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              outline: 'none',
              fontFamily: 'inherit',
              backgroundColor: '#fff',
            }}
          />
        </View>
      );
    }

    // Mobile time picker
    return (
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Birth Time *</Text>
        <Button
          mode="outlined"
          onPress={() => setShowTimePicker(true)}
          style={styles.dateButton}
          icon="clock-outline"
          contentStyle={styles.dateButtonContent}
        >
          {formatTime(birthTime)}
        </Button>
        {showTimePicker && DateTimePicker && (
          <DateTimePicker
            value={birthTime}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedTime) => {
              setShowTimePicker(Platform.OS === 'ios');
              if (selectedTime) {
                setBirthTime(selectedTime);
              }
            }}
          />
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <MaterialCommunityIcons 
              name="account-circle" 
              size={32} 
              color="#6C3FB5" 
            />
            <Text style={styles.headerTitle}>Birth Details</Text>
            <MaterialCommunityIcons 
              name="close" 
              size={24} 
              color="#7F8C8D"
              onPress={onClose}
              style={styles.closeButton}
            />
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6C3FB5" />
              <Text style={styles.loadingText}>Loading your details...</Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Name Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name *</Text>
                <TextInput
                  mode="outlined"
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your full name"
                  style={styles.input}
                  error={!!errors.name}
                  left={<TextInput.Icon icon="account" />}
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>

              {/* Birth Date - Platform Specific */}
              {renderDateInput()}

              {/* Birth Time - Platform Specific */}
              {renderTimeInput()}

              {/* Birth Location */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Birth Place *</Text>
                <TextInput
                  mode="outlined"
                  value={birthLocation}
                  onChangeText={setBirthLocation}
                  placeholder="City, State, Country"
                  style={styles.input}
                  error={!!errors.birthLocation}
                  left={<TextInput.Icon icon="map-marker" />}
                />
                {errors.birthLocation && <Text style={styles.errorText}>{errors.birthLocation}</Text>}
              </View>

              {/* Gender Selection */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Gender *</Text>
                <View style={styles.genderContainer}>
                  <Button
                    mode={gender === 'Male' ? 'contained' : 'outlined'}
                    onPress={() => setGender('Male')}
                    style={styles.genderButton}
                    icon="gender-male"
                  >
                    Male
                  </Button>
                  <Button
                    mode={gender === 'Female' ? 'contained' : 'outlined'}
                    onPress={() => setGender('Female')}
                    style={styles.genderButton}
                    icon="gender-female"
                  >
                    Female
                  </Button>
                  <Button
                    mode={gender === 'Other' ? 'contained' : 'outlined'}
                    onPress={() => setGender('Other')}
                    style={styles.genderButton}
                    icon="gender-transgender"
                  >
                    Other
                  </Button>
                </View>
                {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
              </View>

              {/* Info Note */}
              <View style={styles.infoBox}>
                <MaterialCommunityIcons name="information" size={20} color="#6C3FB5" />
                <Text style={styles.infoText}>
                  Accurate birth time is essential for precise predictions. Check your birth certificate if unsure.
                </Text>
              </View>

              {/* Confirm Button */}
              <Button
                mode="contained"
                onPress={handleConfirm}
                style={styles.confirmButton}
                loading={saving}
                disabled={saving}
                icon="check-circle"
              >
                {saving ? 'Saving...' : 'Confirm & Generate'}
              </Button>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginLeft: 12,
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#7F8C8D',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
  },
  dateButton: {
    justifyContent: 'flex-start',
  },
  dateButtonContent: {
    justifyContent: 'flex-start',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  genderButton: {
    flex: 1,
  },
  errorText: {
    fontSize: 12,
    color: '#E74C3C',
    marginTop: 4,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F0E6FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#6C3FB5',
    marginLeft: 8,
    lineHeight: 18,
  },
  confirmButton: {
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
});
