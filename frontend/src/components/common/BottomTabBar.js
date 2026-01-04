// frontend/src/components/common/BottomTabBar.js
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function BottomTabBar({ navigation, currentScreen = 'Dashboard' }) {
  
  const navItems = [
    { id: 'home', label: 'Home', icon: 'home', screen: 'Home' }, // Changed from 'Dashboard'
    { id: 'chat', label: 'Chat', icon: 'chat', screen: 'ChatScreen' }, // Might need 'Screen' suffix
    { id: 'profile', label: 'Profile', icon: 'account', screen: 'ProfileScreen' }, // Might need 'Screen' suffix
  ];
  const isActive = (screen) => currentScreen === screen;

  const handleNavigation = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <View style={styles.tabBar}>
      {navItems.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.tab}
          onPress={() => handleNavigation(item.screen)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name={item.icon}
            size={24}
            color={isActive(item.screen) ? '#6C3FB5' : '#7F8C8D'}
          />
          <Text style={[styles.label, { color: isActive(item.screen) ? '#6C3FB5' : '#7F8C8D' }]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingVertical: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  label: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});
