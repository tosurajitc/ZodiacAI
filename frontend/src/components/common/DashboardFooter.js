// frontend/src/components/common/DashboardFooter.js
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function DashboardFooter({ navigation }) {
  const quickLinks = [
    { label: 'About Us', screen: 'About' },
    { label: 'Privacy Policy', screen: 'Privacy' },
    { label: 'Terms of Service', screen: 'Terms' },
    { label: 'Contact Us', screen: 'Contact' },
    { label: 'FAQ', screen: 'FAQ' },
    { label: 'Muhurat / Auspicious Timings', screen: 'Muhurat' },
    { label: 'Vastu Shastra', screen: 'Vastu Shastra' },
    { label: 'Numerology', screen: 'Numerology' },
    { label: 'Disclaimer (Astrology is for guidance only)', screen: 'Disclaimer' },
  ];

  const socialMedia = [
    { icon: 'facebook', url: 'https://facebook.com/zodiacai', color: '#1877F2' },
    { icon: 'instagram', url: 'https://instagram.com/zodiacai', color: '#E4405F' },
    { icon: 'twitter', url: 'https://twitter.com/zodiacai', color: '#1DA1F2' },
  ];

  const handleLinkPress = (screen) => {
    if (navigation) {
      navigation.navigate(screen);
    }
  };

  const handleSocialPress = (url) => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.footer}>
      <View style={styles.container}>
        {/* Brand Section */}
        <View style={styles.brandContainer}>
          <MaterialCommunityIcons name="fingerprint" size={40} color="#e1dce8ff" />
          <Text style={styles.brandName}>ZodiacAI</Text>
        </View>
        <Text style={styles.tagline}>
          Your AI-powered Vedic Astrology companion for life guidance and cosmic insights.
        </Text>

        <Divider style={styles.divider} />

        {/* Three-column layout */}
        <View style={styles.columnsContainer}>
          {/* Column 1 */}
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Quick Links</Text>
            {quickLinks.slice(0, 3).map((link, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleLinkPress(link.screen)}
                style={styles.linkItem}
              >
                <MaterialCommunityIcons name="chevron-right" size={16} color="#b8b1c4ff" />
                <Text style={styles.linkText}>{link.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Column 2 */}
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Services</Text>
            {quickLinks.slice(3, 6).map((link, index) => (
              <TouchableOpacity
                key={index + 3}
                onPress={() => handleLinkPress(link.screen)}
                style={styles.linkItem}
              >
                <MaterialCommunityIcons name="chevron-right" size={16} color="#b8b1c4ff" />
                <Text style={styles.linkText}>{link.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Column 3 */}
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>More</Text>
            {quickLinks.slice(6).map((link, index) => (
              <TouchableOpacity
                key={index + 6}
                onPress={() => handleLinkPress(link.screen)}
                style={styles.linkItem}
              >
                <MaterialCommunityIcons name="chevron-right" size={16} color="#b8b1c4ff" />
                <Text style={styles.linkText}>{link.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Contact & Social */}
        <View style={styles.contactSection}>
          <View style={styles.contactItem}>
            <MaterialCommunityIcons name="email" size={18} color="#b8b1c4ff" />
            <Text style={styles.contactText}>zodiacai@gmail.com</Text>
          </View>

          <View style={styles.socialContainer}>
            {socialMedia.map((social, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleSocialPress(social.url)}
                style={[styles.socialIcon, { backgroundColor: social.color + '20' }]}
              >
                <MaterialCommunityIcons name={social.icon} size={24} color={social.color} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Copyright */}
        <View style={styles.copyrightSection}>
          <Text style={styles.copyrightText}>© 2026 ZodiacAI. All rights reserved.</Text>
          <Text style={styles.copyrightSubtext}>Powered by Vedic Astrology & AI</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#2C3E50',
    paddingVertical: 40,
    paddingHorizontal: 20,
    marginTop: 40,
  },
  container: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  tagline: {
    fontSize: 14,
    color: '#BDC3C7',
    lineHeight: 20,
  },
  divider: {
    backgroundColor: '#34495E',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  columnsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  column: {
    flex: 1,
    minWidth: 200,
    marginRight: 20,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  linkText: {
    fontSize: 14,
    color: '#ECF0F1',
    marginLeft: 4,
  },
  contactSection: {
    marginBottom: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#ECF0F1',
    marginLeft: 12,
  },
  socialContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  socialIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyrightSection: {
    alignItems: 'center',
    paddingTop: 20,
  },
  copyrightText: {
    fontSize: 14,
    color: '#BDC3C7',
    marginBottom: 4,
  },
  copyrightSubtext: {
    fontSize: 12,
    color: '#95A5A6',
  },
});
