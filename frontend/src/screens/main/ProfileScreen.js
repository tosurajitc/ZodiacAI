import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Avatar, List, Divider, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOutUser } from '../../services/firebase/auth';

export default function ProfileScreen({ navigation }) {
  
  // ✅ Real user data from AsyncStorage
  const [userData, setUserData] = useState({
    name: 'Loading...',
    email: 'Loading...',
    photoURL: null,
    memberSince: 'Dec 2024',
    questionsAsked: 12,
    questionsRemaining: 3,
    dailyLimit: 5,
  });

  // ✅ Load user data on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('@astroai_user_data');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setUserData(prev => ({
            ...prev,
            name: user.name || 'User',
            email: user.email || '',
            photoURL: user.photoURL || null,
          }));
          console.log('Profile loaded user:', user.name);
        }
      } catch (error) {
        console.error('Error loading user data in profile:', error);
      }
    };

    loadUserData();
  }, []);

  const handleEditProfile = () => {
    Alert.alert('Coming Soon', 'Profile editing will be available soon!');
  };

  const handleEditBirthDetails = () => {
    navigation.navigate('BirthDetails');
  };

  const handleFeedback = () => {
    Alert.alert('Feedback', 'Feedback form will open here');
  };

  const handleShare = () => {
    Alert.alert('Share App', 'Share functionality coming soon!');
  };

  const handleRateUs = () => {
    Alert.alert('Rate Us', 'Play Store rating will open here');
  };

  const handlePrivacy = () => {
    Alert.alert('Privacy Policy', 'Privacy policy details will be shown here');
  };

  const handleTerms = () => {
    Alert.alert('Terms of Service', 'Terms details will be shown here');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              // ✅ Sign out from Firebase
              await signOutUser();
              // ✅ Clear AsyncStorage
              await AsyncStorage.multiRemove(['@astroai_user_data', '@astroai_auth_token']);
              console.log('User logged out successfully');
              // Navigation will be handled by AppNavigator automatically
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#6C3FB5', '#4A90E2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Profile</Text>
        
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <Avatar.Text 
            size={80} 
            label={userData.name.split(' ').map(n => n[0]).join('')}
            style={styles.avatar}
          />
          <Text style={styles.userName}>{userData.name}</Text>
          <Text style={styles.userEmail}>{userData.email}</Text>
          <Text style={styles.memberSince}>Member since {userData.memberSince}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <StatCard 
            icon="chat-question" 
            value={userData.questionsAsked} 
            label="Questions Asked"
          />
          <StatCard 
            icon="chat-outline" 
            value={`${userData.questionsRemaining}/${userData.dailyLimit}`} 
            label="Today's Remaining"
          />
        </View>
      </LinearGradient>

      {/* Menu Items */}
      <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
        
        {/* Account Section */}
        <Text style={styles.sectionTitle}>ACCOUNT</Text>
        <List.Item
          title="Edit Profile"
          description="Update your personal information"
          left={props => <List.Icon {...props} icon="account-edit" color="#6C3FB5" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={handleEditProfile}
          style={styles.menuItem}
        />
        <Divider />
        <List.Item
          title="Birth Details"
          description="Edit your birth information"
          left={props => <List.Icon {...props} icon="calendar-edit" color="#6C3FB5" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={handleEditBirthDetails}
          style={styles.menuItem}
        />
        <Divider />

        {/* App Section */}
        <Text style={styles.sectionTitle}>APP</Text>
        <List.Item
          title="Send Feedback"
          description="Help us improve"
          left={props => <List.Icon {...props} icon="message-alert" color="#27AE60" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={handleFeedback}
          style={styles.menuItem}
        />
        <Divider />
        <List.Item
          title="Share App"
          description="Invite friends to ZodiacAI"
          left={props => <List.Icon {...props} icon="share-variant" color="#F39C12" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={handleShare}
          style={styles.menuItem}
        />
        <Divider />
        <List.Item
          title="Rate Us"
          description="Rate us on Play Store"
          left={props => <List.Icon {...props} icon="star" color="#E74C3C" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={handleRateUs}
          style={styles.menuItem}
        />
        <Divider />

        {/* Legal Section */}
        <Text style={styles.sectionTitle}>LEGAL</Text>
        <List.Item
          title="Privacy Policy"
          left={props => <List.Icon {...props} icon="shield-check" color="#7F8C8D" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={handlePrivacy}
          style={styles.menuItem}
        />
        <Divider />
        <List.Item
          title="Terms of Service"
          left={props => <List.Icon {...props} icon="file-document" color="#7F8C8D" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={handleTerms}
          style={styles.menuItem}
        />
        <Divider />

        {/* Logout Button */}
        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutButton}
          textColor="#E74C3C"
          icon="logout"
        >
          Logout
        </Button>

        {/* App Version */}
        <Text style={styles.versionText}>Version 1.0.0 (Beta)</Text>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

// Stat Card Component
function StatCard({ icon, value, label }) {
  return (
    <View style={styles.statCard}>
      <MaterialCommunityIcons name={icon} size={24} color="#FFFFFF" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 12,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  userEmail: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
  },
  memberSince: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.7,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
    textAlign: 'center',
  },
  menuContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: -10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#7F8C8D',
    marginLeft: 20,
    marginTop: 20,
    marginBottom: 8,
  },
  menuItem: {
    backgroundColor: '#FFFFFF',
  },
  logoutButton: {
    marginHorizontal: 20,
    marginTop: 30,
    borderColor: '#E74C3C',
    borderRadius: 8,
  },
  versionText: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 20,
  },
  bottomPadding: {
    height: 40,
  },
});