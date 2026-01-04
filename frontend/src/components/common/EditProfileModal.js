// frontend/src/components/common/EditProfileModal.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, IconButton } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export default function EditProfileModal({ visible, onClose, onConfirm }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('prefer_not_to_say');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadUserData();
    }
  }, [visible]);

  const loadUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('@astroai_user_data');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        setName(userData.name || '');
        setEmail(userData.email || '');
        setPhone(userData.phone || '');
        setGender(userData.gender || 'prefer_not_to_say');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (phone && phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('@astroai_auth_token');

      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          gender
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update AsyncStorage with new data
        const updatedUserData = {
          ...data.data,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          gender
        };
        await AsyncStorage.setItem('@astroai_user_data', JSON.stringify(updatedUserData));

        Alert.alert('Success', 'Profile updated successfully!');
        
        if (onConfirm) {
          onConfirm(updatedUserData);
        }
        onClose();
      } else {
        Alert.alert('Error', data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    loadUserData();
    onClose();
  };

  const genderOptions = [
    { value: 'male', label: 'Male', icon: 'gender-male' },
    { value: 'female', label: 'Female', icon: 'gender-female' },
    { value: 'other', label: 'Other', icon: 'gender-male-female' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say', icon: 'help-circle-outline' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Edit Profile</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={handleCancel}
            />
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                mode="outlined"
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                left={<TextInput.Icon icon="account" />}
                style={styles.input}
              />
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address *</Text>
              <TextInput
                mode="outlined"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                left={<TextInput.Icon icon="email" />}
                style={styles.input}
              />
            </View>

            {/* Phone Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                mode="outlined"
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
                left={<TextInput.Icon icon="phone" />}
                style={styles.input}
              />
            </View>

            {/* Gender - Radio Buttons */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.radioGroup}>
                {genderOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.radioButton}
                    onPress={() => setGender(option.value)}
                  >
                    <MaterialCommunityIcons
                      name={gender === option.value ? 'radiobox-marked' : 'radiobox-blank'}
                      size={24}
                      color={gender === option.value ? '#6C3FB5' : '#BDC3C7'}
                    />
                    <MaterialCommunityIcons
                      name={option.icon}
                      size={20}
                      color="#7F8C8D"
                      style={{ marginLeft: 8 }}
                    />
                    <Text style={styles.radioLabel}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Info Note */}
            <View style={styles.noteContainer}>
              <MaterialCommunityIcons name="information" size={20} color="#6C3FB5" />
              <Text style={styles.noteText}>
                Your information is secure and will only be used for personalized astrological readings.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button
              mode="outlined"
              onPress={handleCancel}
              style={styles.cancelButton}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSave}
              style={styles.saveButton}
              loading={loading}
              disabled={loading}
            >
              Save Changes
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  content: {
    padding: 20,
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
    backgroundColor: '#fff',
  },
  radioGroup: {
    gap: 12,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  radioLabel: {
    fontSize: 15,
    color: '#2C3E50',
    marginLeft: 12,
    flex: 1,
  },
  noteContainer: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    gap: 10,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: '#2C3E50',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});
