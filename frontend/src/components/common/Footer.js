// frontend/src/components/common/Footer.js
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Footer({ navigation, currentScreen = 'Dashboard' }) {
  
  const navItems = [
    { 
      id: 'home', 
      label: 'Home', 
      icon: 'home', 
      screen: 'Dashboard' 
    },
    { 
      id: 'chat', 
      label: 'Chat', 
      icon: 'chat', 
      screen: 'Chat' 
    },
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: 'account', 
      screen: 'Profile' 
    },
  ];

  const isActive = (screen) => currentScreen === screen;

  const handleNavigation = (screen) => {
    if (screen !== currentScreen) {
      navigation.navigate(screen);
    }
  };

  return (
    <View style={styles.footer}>
      <View style={styles.container}>
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.navItem}
            onPress={() => handleNavigation(item.screen)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={item.icon}
              size={24}
              color={isActive(item.screen) ? '#6C3FB5' : '#7F8C8D'}
            />
            <Text
              style={[
                styles.navLabel,
                { color: isActive(item.screen) ? '#6C3FB5' : '#7F8C8D' }
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
    paddingVertical: 4,
    minWidth: 60,
  },
  navLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});
