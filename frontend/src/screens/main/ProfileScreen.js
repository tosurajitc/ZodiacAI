// frontend/src/screens/main/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, List, Avatar, Button, Divider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut } from '../../services/firebase/auth';
import Header from '../../components/common/Header';
import BirthDetailsModal from '../../components/common/BirthDetailsModal';
import EditProfileModal from '../../components/common/EditProfileModal';

export default function ProfileScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [showBirthModal, setShowBirthModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('@astroai_user_data');
      if (userDataString) {
        setUserData(JSON.parse(userDataString));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleBirthDetailsClick = () => {
    setShowBirthModal(true);
  };

  const handleBirthDetailsUpdate = async () => {
    await loadUserData();
    Alert.alert('Success', 'Birth details updated successfully!');
  };

  const handleEditProfile = () => {
    console.log('Edit Profile clicked');
    setShowEditModal(true);
  };

  const handleProfileUpdate = async (updatedData) => {
    setUserData(updatedData);
    await loadUserData();
  };

  const handleLogout = async () => {
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
              await signOut();
              await AsyncStorage.multiRemove(['@astroai_user_data', '@astroai_auth_token']);
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  const handleFeedback = () => {
    Alert.alert('Coming Soon', 'Feedback feature coming soon!');
  };

  return (
    <View style={styles.container}>
      <Header navigation={navigation} />

      <BirthDetailsModal
        visible={showBirthModal}
        onClose={() => setShowBirthModal(false)}
        onConfirm={handleBirthDetailsUpdate}
        purpose="profile"
      />

      <EditProfileModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        onConfirm={handleProfileUpdate}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <Avatar.Text 
            size={80} 
            label={userData?.name?.substring(0, 2).toUpperCase() || 'U'} 
            style={styles.avatar}
          />
          <Text style={styles.userName}>{userData?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{userData?.email || 'user@example.com'}</Text>
          <Button 
            mode="outlined" 
            onPress={handleEditProfile}
            style={styles.editButton}
            icon="pencil"
          >
            Edit Profile
          </Button>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Account</Text>
            <Divider style={styles.divider} />
            
            <List.Item
              title="Birth Details"
              description="Manage your birth information"
              left={props => <List.Icon {...props} icon="calendar-account" color="#6C3FB5" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleBirthDetailsClick}
              style={styles.listItem}
            />
            
            <List.Item
              title="Subscription"
              description="Manage your plan"
              left={props => <List.Icon {...props} icon="crown" color="#F39C12" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Alert.alert('Coming Soon', 'Subscription management coming soon!')}
              style={styles.listItem}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Support</Text>
            <Divider style={styles.divider} />
            
            <List.Item
              title="Help Center"
              description="Get help and support"
              left={props => <List.Icon {...props} icon="help-circle" color="#9C27B0" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Alert.alert('Coming Soon', 'Help center coming soon!')}
              style={styles.listItem}
            />
            
            <List.Item
              title="Send Feedback"
              description="Share your thoughts"
              left={props => <List.Icon {...props} icon="message-text" color="#00BCD4" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleFeedback}
              style={styles.listItem}
            />
            
            <List.Item
              title="Privacy Policy"
              description="Read our privacy policy"
              left={props => <List.Icon {...props} icon="shield-account" color="#607D8B" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Alert.alert('Coming Soon', 'Privacy policy coming soon!')}
              style={styles.listItem}
            />
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutButton}
          icon="logout"
          buttonColor="#E74C3C"
        >
          Logout
        </Button>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  profileHeader: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
  },
  avatar: { backgroundColor: '#6C3FB5', marginBottom: 15 },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#2C3E50', marginBottom: 5 },
  userEmail: { fontSize: 14, color: '#7F8C8D', marginBottom: 15 },
  editButton: { marginTop: 10 },
  card: { margin: 15, borderRadius: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2C3E50', marginBottom: 10 },
  divider: { marginBottom: 10 },
  listItem: { paddingVertical: 4 },
  logoutButton: { margin: 15, marginTop: 20 },
  bottomPadding: { height: 30 },
});
