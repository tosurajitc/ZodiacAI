import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Alert } from 'react-native';
import { Text, Card, Chip, Divider, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle, Line, Text as SvgText, G } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { kundliAPI } from '../../services/api/kundliAPI';
import Loading from '../../components/common/Loading';
import * as FileSystem from 'expo-file-system';    
import * as Sharing from 'expo-sharing';    


const { width } = Dimensions.get('window');
const CHART_SIZE = width - 80;

export default function KundliViewScreen({ navigation, route }) {
  const [kundliData, setKundliData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState('');


  useEffect(() => {
    loadUserName();
    fetchKundliData();
  }, []);

  const loadUserName = async () => {
    try {
      const userData = await AsyncStorage.getItem('@astroai_user_data');
      if (userData) {
        const user = JSON.parse(userData);
        setUserName(user.name || '');
      }
    } catch (error) {
      console.error('Error loading user name:', error);
    }
  };

  const fetchKundliData = async () => {
    try {
      setLoading(true);
      setError(null);

      // ✅ FIRST: Check if data was passed via navigation params
      if (route.params?.kundliData) {
        console.log('Using kundli data from navigation params');
        setKundliData(route.params.kundliData);
        setLoading(false);
        return; // ← EXIT HERE - Don't call API
      }

      // ✅ SECOND: Only reach here if NO data was passed
      const userDataString = await AsyncStorage.getItem('@astroai_user_data');
      if (!userDataString) {
        setError('User not logged in');
        setLoading(false);
        return;
      }

      setError('No Kundli found. Please generate your Kundli first.');
      setLoading(false);

    } catch (err) {
      console.error('Error fetching Kundli:', err);
      setError('Failed to load Kundli data');
      setLoading(false);
    }
  };



// ABSOLUTELY FINAL VERSION - Copy this EXACTLY
// Replace handleDownloadPDF in KundliViewScreen.js

  const handleDownloadPDF = async () => {
    console.log('🔥 Step 1: Download button clicked');
    
    if (!kundliData) {
      console.log('❌ No kundli data');
      Alert.alert('Error', 'No Kundli data available');
      return;
    }

    try {
      const kundliId = kundliData.id;
      console.log('📋 Step 2: Kundli ID:', kundliId);
      
      if (!kundliId) {
        Alert.alert('Error', 'Kundli ID not found');
        return;
      }

      // Get token from localStorage
      const token = localStorage.getItem('@astroai_auth_token');
      console.log('🔑 Step 3: Token found:', !!token);
      console.log('🔑 Token preview:', token ? token.substring(0, 20) + '...' : 'NULL');
      
      if (!token) {
        Alert.alert('Error', 'Please log in again');
        return;
      }

      console.log('🚀 Step 4: Starting download...');
      const API_URL = 'http://localhost:5000';
      const url = `${API_URL}/api/kundli/${kundliId}/pdf`;
      
      console.log('📡 Step 5: Fetching from:', url);
      console.log('📡 Step 5b: Authorization header:', `Bearer ${token.substring(0, 20)}...`);

      // Fetch PDF with auth
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/pdf',
        },
      });

      console.log('✅ Step 6: Response status:', response.status);

      if (response.status !== 200) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        Alert.alert('Error', `Failed to download PDF (Status: ${response.status})`);
        return;
      }

      console.log('📥 Step 7: Converting to blob...');
      const blob = await response.blob();
      console.log('📦 Step 8: Blob size:', blob.size, 'bytes');

      if (blob.size === 0) {
        Alert.alert('Error', 'PDF is empty');
        return;
      }

      console.log('💾 Step 9: Creating download link...');
      
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `Kundli_${userName || 'User'}_${Date.now()}.pdf`;
      link.style.display = 'none';
      
      console.log('🔗 Step 10: Appending link to document...');
      document.body.appendChild(link);
      
      console.log('🖱️ Step 11: Clicking download link...');
      link.click();
      
      console.log('🧹 Step 12: Cleaning up...');
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
        console.log('✅ Step 13: Download complete!');
      }, 100);
      
      Alert.alert('Success', 'PDF downloaded successfully!');
      
    } catch (err) {
      console.error('❌ DOWNLOAD ERROR:', err);
      console.error('Error stack:', err.stack);
      Alert.alert('Error', `Download failed: ${err.message}`);
    }
  };



  const handleShare = () => {
    Alert.alert('Coming Soon', 'Share feature will be available soon!');
  };

  if (loading) {
    return <Loading fullscreen />;
  }

  if (error || !kundliData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <MaterialCommunityIcons 
            name="arrow-left" 
            size={24} 
            color="#2C3E50" 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
          <Text style={styles.headerTitle}>Your Kundli</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={64} color="#E74C3C" />
          <Text style={styles.errorText}>{error || 'No Kundli data available'}</Text>
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('BirthDetails')}
            style={styles.generateButton}
          >
            Generate Your Kundli
          </Button>
        </View>
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>Your Kundli</Text>
        <MaterialCommunityIcons 
          name="download" 
          size={24} 
          color="#6C3FB5"
          style={styles.downloadButton}
          onPress={handleDownloadPDF}
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Birth Details Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Birth Details</Text>
            <Divider style={styles.divider} />
            <DetailRow icon="account" label="Name" value={userName || kundliData.birthDetails?.name || 'N/A'} />
            <DetailRow icon="calendar" label="Date" value={kundliData.birthDetails?.dateOfBirth || 'N/A'} />
            <DetailRow icon="clock-outline" label="Time" value={kundliData.birthDetails?.timeOfBirth || 'N/A'} />
            <DetailRow icon="map-marker" label="Place" value={kundliData.birthDetails?.placeOfBirth || 'N/A'} />
          </Card.Content>
        </Card>

        {/* Main Signs Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Primary Signs</Text>
            <Divider style={styles.divider} />
            <View style={styles.signsContainer}>
              <SignChip 
                icon="white-balance-sunny" 
                label="Sun Sign" 
                value={kundliData.kundli?.sunSign || 'N/A'} 
                color="#F39C12" 
              />
              <SignChip 
                icon="moon-waning-crescent" 
                label="Moon Sign" 
                value={kundliData.kundli?.moonSign || 'N/A'} 
                color="#4A90E2" 
              />
              <SignChip 
                icon="arrow-up-circle" 
                label="Ascendant" 
                value={kundliData.kundli?.ascendant || 'N/A'} 
                color="#9B59B6" 
              />
            </View>
          </Card.Content>
        </Card>

        {/* Rasi Chart (Simplified Version) */}
        {kundliData.planetaryPositions && kundliData.planetaryPositions.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>Rasi Chart (D1)</Text>
              <Divider style={styles.divider} />
              <View style={styles.chartContainer}>
                <RasiChart planets={kundliData.planetaryPositions} />
              </View>
              <Text style={styles.chartNote}>
                ⓘ This is a simplified birth chart. Full interactive chart coming soon!
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Planetary Positions */}
        {kundliData.planetaryPositions && kundliData.planetaryPositions.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>Planetary Positions</Text>
              <Divider style={styles.divider} />
              {kundliData.planetaryPositions.map((planet, index) => (
                <View key={index}>
                  <PlanetRow planet={planet} />
                  {index < kundliData.planetaryPositions.length - 1 && <Divider style={styles.planetDivider} />}
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Current Dasha */}
        {kundliData.dashas && kundliData.dashas.currentDasha && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>Current Dasha Period</Text>
              <Divider style={styles.divider} />
              <View style={styles.dashaContainer}>
                <View style={styles.dashaRow}>
                  <Text style={styles.dashaLabel}>Mahadasha:</Text>
                  <Chip style={styles.dashaChip}>
                    {kundliData.dashas.currentDasha.mahadasha || 'N/A'}
                  </Chip>
                </View>
                <View style={styles.dashaRow}>
                  <Text style={styles.dashaLabel}>Antardasha:</Text>
                  <Chip style={styles.dashaChip}>
                    {kundliData.dashas.currentDasha.antardasha || 'N/A'}
                  </Chip>
                </View>
                {kundliData.dashas.currentDasha.startDate && kundliData.dashas.currentDasha.endDate && (
                  <View style={styles.dashaPeriod}>
                    <MaterialCommunityIcons name="calendar-range" size={16} color="#7F8C8D" />
                    <Text style={styles.dashaPeriodText}>
                      {kundliData.dashas.currentDasha.startDate} - {kundliData.dashas.currentDasha.endDate}
                    </Text>
                  </View>
                )}
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button 
            mode="contained" 
            icon="download"
            style={styles.actionButton}
            onPress={handleDownloadPDF}
          >
            Download PDF
          </Button>
          <Button 
            mode="outlined" 
            icon="share-variant"
            style={styles.actionButton}
            onPress={handleShare}
          >
            Share
          </Button>
        </View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

// Detail Row Component
function DetailRow({ icon, label, value }) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailLabel}>
        <MaterialCommunityIcons name={icon} size={20} color="#6C3FB5" />
        <Text style={styles.detailLabelText}>{label}</Text>
      </View>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

// Sign Chip Component
function SignChip({ icon, label, value, color }) {
  return (
    <View style={styles.signChip}>
      <View style={[styles.signIcon, { backgroundColor: color }]}>
        <MaterialCommunityIcons name={icon} size={24} color="#FFFFFF" />
      </View>
      <Text style={styles.signLabel}>{label}</Text>
      <Text style={styles.signValue}>{value}</Text>
    </View>
  );
}

// Planet Row Component
function PlanetRow({ planet }) {
  return (
    <View style={styles.planetRow}>
      <View style={styles.planetInfo}>
        <Text style={styles.planetName}>{planet.name}</Text>
        <Text style={styles.planetDetails}>
          {planet.sign} • House {planet.house}
        </Text>
      </View>
      <Text style={styles.planetDegree}>{planet.degree}</Text>
    </View>
  );
}

// Simplified Rasi Chart Component
function RasiChart({ planets }) {
  const houses = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const signs = ['Ari', 'Tau', 'Gem', 'Can', 'Leo', 'Vir', 'Lib', 'Sco', 'Sag', 'Cap', 'Aqu', 'Pis'];
  
  // Group planets by house
  const planetsByHouse = {};
  planets.forEach(planet => {
    if (!planetsByHouse[planet.house]) {
      planetsByHouse[planet.house] = [];
    }
    planetsByHouse[planet.house].push(planet.name.substring(0, 2));
  });

  return (
    <Svg width={CHART_SIZE} height={CHART_SIZE}>
      {/* Draw 12 house grid (3x4) */}
      {houses.map((house, index) => {
        const row = Math.floor(index / 3);
        const col = index % 3;
        const cellSize = CHART_SIZE / 3;
        const x = col * cellSize;
        const y = row * cellSize;

        return (
          <G key={house}>
            {/* House border */}
            <Line
              x1={x}
              y1={y}
              x2={x + cellSize}
              y2={y}
              stroke="#E0E0E0"
              strokeWidth="2"
            />
            <Line
              x1={x + cellSize}
              y1={y}
              x2={x + cellSize}
              y2={y + cellSize}
              stroke="#E0E0E0"
              strokeWidth="2"
            />
            <Line
              x1={x + cellSize}
              y1={y + cellSize}
              x2={x}
              y2={y + cellSize}
              stroke="#E0E0E0"
              strokeWidth="2"
            />
            <Line
              x1={x}
              y1={y + cellSize}
              x2={x}
              y2={y}
              stroke="#E0E0E0"
              strokeWidth="2"
            />

            {/* House number */}
            <SvgText
              x={x + 10}
              y={y + 20}
              fontSize="12"
              fill="#7F8C8D"
              fontWeight="bold"
            >
              {house}
            </SvgText>

            {/* Sign */}
            <SvgText
              x={x + cellSize - 30}
              y={y + 20}
              fontSize="11"
              fill="#6C3FB5"
            >
              {signs[house - 1]}
            </SvgText>

            {/* Planets in this house */}
            {planetsByHouse[house] && (
              <SvgText
                x={x + cellSize / 2}
                y={y + cellSize / 2 + 5}
                fontSize="14"
                fill="#2C3E50"
                fontWeight="bold"
                textAnchor="middle"
              >
                {planetsByHouse[house].join(', ')}
              </SvgText>
            )}
          </G>
        );
      })}
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
  downloadButton: {
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  generateButton: {
    borderRadius: 8,
    paddingHorizontal: 24,
  },
  card: {
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  divider: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabelText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginLeft: 8,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  signsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signChip: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  signIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  signLabel: {
    fontSize: 11,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  signValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  chartNote: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  planetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  planetInfo: {
    flex: 1,
  },
  planetName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  planetDetails: {
    fontSize: 13,
    color: '#7F8C8D',
  },
  planetDegree: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6C3FB5',
  },
  planetDivider: {
    marginVertical: 4,
  },
  dashaContainer: {
    marginTop: 8,
  },
  dashaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dashaLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  dashaChip: {
    backgroundColor: '#E3F2FD',
  },
  dashaPeriod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  dashaPeriodText: {
    fontSize: 13,
    color: '#2C3E50',
    marginLeft: 8,
  },
  actionButtons: {
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    borderRadius: 8,
    marginBottom: 8,
  },
  bottomPadding: {
    height: 40,
  },
});