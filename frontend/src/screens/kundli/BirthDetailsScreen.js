import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../constants/config';

// ✅ Conditionally import DateTimePicker only for mobile
let DateTimePicker;
if (Platform.OS !== 'web') {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
}

export default function BirthDetailsScreen({ navigation }) {
  
  const [name, setName] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Different state for web vs mobile
  const [webBirthDate, setWebBirthDate] = useState('');
  const [webBirthTime, setWebBirthTime] = useState('');
  const [mobileBirthDate, setMobileBirthDate] = useState(new Date());
  const [mobileBirthTime, setMobileBirthTime] = useState(new Date());
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // ✅ Load user name from AsyncStorage on mount
  useEffect(() => {
    const loadUserName = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('@astroai_user_data');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setName(user.name || '');
          console.log('Pre-filled name:', user.name);
        }
      } catch (error) {
        console.error('Error loading user name:', error);
      }
    };

    loadUserName();
  }, []);

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setMobileBirthDate(selectedDate);
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setMobileBirthTime(selectedTime);
    }
  };

  const handleGenerateKundli = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    // Check date based on platform
    if (Platform.OS === 'web' && !webBirthDate) {
      Alert.alert('Error', 'Please select your birth date');
      return;
    }

    // Check time based on platform
    if (Platform.OS === 'web' && !webBirthTime) {
      Alert.alert('Error', 'Please select your birth time');
      return;
    }

    if (!birthPlace.trim()) {
      Alert.alert('Error', 'Please enter your birth place');
      return;
    }

    setLoading(true);

    try {
      // Get auth token
      const token = await AsyncStorage.getItem('@astroai_auth_token');
      
      // Prepare data based on platform
      const birthData = {
        name,
        dateOfBirth: Platform.OS === 'web' ? webBirthDate : mobileBirthDate.toISOString().split('T')[0],
        timeOfBirth: Platform.OS === 'web' ? webBirthTime + ':00' : formatTime(mobileBirthTime) + ':00',
        placeOfBirth: birthPlace
      };

      console.log('Sending birth details to backend:', birthData);

      console.log('=== FRONTEND DEBUG ===');
      console.log('Name state variable:', name);
      console.log('Name.length:', name.length);
      console.log('BirthData object:', JSON.stringify(birthData, null, 2));


      // Call backend API
      const response = await fetch(`${API_BASE_URL}/api/kundli/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(birthData)
      });

      const data = await response.json();
      // TEMPORARY DEBUG - Remove after
      console.log('=== COMPLETE DATA STRUCTURE ===');
      console.log('birthDetails:', JSON.stringify(data.data.birthDetails, null, 2));
      console.log('planetaryPositions:', JSON.stringify(data.data.planetaryPositions, null, 2));
      console.log('houses:', JSON.stringify(data.data.houses, null, 2));
      console.log('dashas:', JSON.stringify(data.data.dashas, null, 2));
      console.log('📋 Backend response:', JSON.stringify(data, null, 2));

      if (!response.ok) {
        if (data.error?.details) {
          console.log('❌ Validation errors:', data.error.details);
        }
        throw new Error(data.error?.message || 'Failed to generate Kundli');
      }

      console.log('Kundli generated successfully:', data);
      // Store kundliId in AsyncStorage
      if (data.data?.id) {
        await AsyncStorage.setItem('@astroai_kundli_id', data.data.id);
      }
      
      setLoading(false);
      
      // Direct navigation (Alert doesn't work reliably on web)
      console.log('Navigating to KundliView with data:', data.data);
      navigation.navigate('KundliView', { kundliData: data.data });
      
    } catch (error) {
      setLoading(false);
      console.error('Error generating Kundli:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to generate Kundli. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const renderDatePicker = () => {
    if (Platform.OS === 'web') {
      return (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date of Birth *</Text>
          <input
            type="date"
            value={webBirthDate}
            max={new Date().toISOString().split('T')[0]}
            min="1920-01-01"
            onChange={(e) => setWebBirthDate(e.target.value)}
            style={{
              width: '100%',
              padding: 16,
              fontSize: 16,
              borderRadius: 4,
              border: '1px solid #E0E0E0',
              outline: 'none',
              fontFamily: 'system-ui',
            }}
          />
        </View>
      );
    }

    // Mobile version
    return (
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Date of Birth *</Text>
        <Button
          mode="outlined"
          onPress={() => setShowDatePicker(true)}
          icon="calendar"
          style={styles.dateButton}
          contentStyle={styles.dateButtonContent}
          labelStyle={styles.dateButtonLabel}
        >
          {formatDate(mobileBirthDate)}
        </Button>
        {showDatePicker && DateTimePicker && (
          <DateTimePicker
            value={mobileBirthDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
            minimumDate={new Date(1920, 0, 1)}
          />
        )}
      </View>
    );
  };

  const renderTimePicker = () => {
    if (Platform.OS === 'web') {
      return (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Time of Birth *</Text>
          <input
            type="time"
            value={webBirthTime}
            onChange={(e) => setWebBirthTime(e.target.value)}
            style={{
              width: '100%',
              padding: 16,
              fontSize: 16,
              borderRadius: 4,
              border: '1px solid #E0E0E0',
              outline: 'none',
              fontFamily: 'system-ui',
            }}
          />
        </View>
      );
    }

    // Mobile version
    return (
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Time of Birth *</Text>
        <Button
          mode="outlined"
          onPress={() => setShowTimePicker(true)}
          icon="clock-outline"
          style={styles.dateButton}
          contentStyle={styles.dateButtonContent}
          labelStyle={styles.dateButtonLabel}
        >
          {formatTime(mobileBirthTime)}
        </Button>
        {showTimePicker && DateTimePicker && (
          <DateTimePicker
            value={mobileBirthTime}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialCommunityIcons 
          name="arrow-left" 
          size={24} 
          color="#2C3E50" 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
        <Text style={styles.headerTitle}>Birth Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Info Card */}
        <View style={styles.infoCard}>
          <MaterialCommunityIcons name="information" size={24} color="#4A90E2" />
          <Text style={styles.infoText}>
            Enter accurate birth details for precise astrological predictions
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          
          {/* Name Input */}
          <TextInput
            label="Full Name *"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
            outlineColor="#E0E0E0"
            activeOutlineColor="#6C3FB5"
            left={<TextInput.Icon icon="account" />}
          />

          {/* Date of Birth */}
          {renderDatePicker()}

          {/* Time of Birth */}
          {renderTimePicker()}

          {/* Birth Place */}
          <TextInput
            label="Birth Place *"
            value={birthPlace}
            onChangeText={setBirthPlace}
            mode="outlined"
            style={styles.input}
            outlineColor="#E0E0E0"
            activeOutlineColor="#6C3FB5"
            left={<TextInput.Icon icon="map-marker" />}
            placeholder="e.g., Bangalore, India"
          />

          {/* Helper Text */}
          <View style={styles.helperTextContainer}>
            <MaterialCommunityIcons name="lightbulb-outline" size={16} color="#F39C12" />
            <Text style={styles.helperText}>
              Don't know exact birth time? Enter approximate time. You can update it later.
            </Text>
          </View>

          {/* Generate Button */}
          <Button
            mode="contained"
            onPress={handleGenerateKundli}
            loading={loading}
            disabled={loading}
            style={styles.generateButton}
            contentStyle={styles.generateButtonContent}
            icon="chart-arc"
          >
            {loading ? 'Generating...' : 'Generate Kundli'}
          </Button>

          {/* Privacy Note */}
          <View style={styles.privacyNote}>
            <MaterialCommunityIcons name="shield-check" size={16} color="#27AE60" />
            <Text style={styles.privacyText}>
              Your data is encrypted and never shared with third parties
            </Text>
          </View>
        </View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#2C3E50',
    marginLeft: 12,
    lineHeight: 20,
  },
  form: {
    marginTop: 10,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  dateButton: {
    borderColor: '#E0E0E0',
    borderRadius: 8,
  },
  dateButtonContent: {
    height: 56,
    justifyContent: 'flex-start',
  },
  dateButtonLabel: {
    fontSize: 16,
    color: '#2C3E50',
  },
  helperTextContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  helperText: {
    flex: 1,
    fontSize: 12,
    color: '#2C3E50',
    marginLeft: 8,
    lineHeight: 18,
  },
  generateButton: {
    borderRadius: 8,
    backgroundColor: '#6C3FB5',
  },
  generateButtonContent: {
    height: 56,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
  },
  privacyText: {
    fontSize: 12,
    color: '#7F8C8D',
    marginLeft: 8,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 40,
  },
});