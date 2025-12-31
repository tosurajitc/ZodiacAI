import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Alert } from 'react-native';
import { Text, Card, Chip, Divider, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Line, Text as SvgText, G } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loading from '../../components/common/Loading';

const { width } = Dimensions.get('window');
const CHART_SIZE = width - 80;

// Zodiac Signs Data
const ZODIAC_SIGNS = [
  { 
    short: 'Ari', 
    name: 'Aries', 
    sanskrit: 'Mesha', 
    element: 'Fire', 
    color: '#E74C3C',
    symbol: '🐏',
    description: [
      'Basic nature: Cardinal fire sign ruled by Mars; impulsive, pioneering, action-oriented, courageous, competitive.',
      'Core qualities: Initiative, leadership, independence, physical energy, but also impatience and tendency to act before thinking.',
      'Life themes: Self-expression, starting new projects, taking risks, fighting for causes, and learning to balance courage with patience.'
    ]
  },
  { 
    short: 'Tau', 
    name: 'Taurus', 
    sanskrit: 'Vrishabha', 
    element: 'Earth', 
    color: '#27AE60',
    symbol: '🐂',
    description: [
      'Basic nature: Fixed earth sign ruled by Venus; stable, practical, comfort-loving, and sensual.',
      'Core qualities: Persistence, reliability, strong attachment to possessions and values, love for beauty, music, food, and nature.',
      'Life themes: Building material security, valuing self-worth, cultivating patience, and avoiding stagnation or stubborn resistance to change.'
    ]
  },
  { 
    short: 'Gem', 
    name: 'Gemini', 
    sanskrit: 'Mithuna', 
    element: 'Air', 
    color: '#3498DB',
    symbol: '👫',
    description: [
      'Basic nature: Dual air sign ruled by Mercury; curious, communicative, adaptable, mentally quick.',
      'Core qualities: Love of information, conversation, networking, writing, and learning; can become scattered or inconsistent when unfocused.',
      'Life themes: Developing communication skills, balancing logic and restlessness, integrating multiple interests into a coherent path.'
    ]
  },
  { 
    short: 'Can', 
    name: 'Cancer', 
    sanskrit: 'Karka', 
    element: 'Water', 
    color: '#9B59B6',
    symbol: '🦀',
    description: [
      'Basic nature: Cardinal water sign ruled by the Moon; emotional, nurturing, protective, home-oriented.',
      'Core qualities: Strong intuition, attachment to family and roots, deep sensitivity, tendency to retreat into a shell when hurt.',
      'Life themes: Creating emotional security, caring for others without over-clinging, honoring feelings while avoiding moodiness or over-defensiveness.'
    ]
  },
  { 
    short: 'Leo', 
    name: 'Leo', 
    sanskrit: 'Simha', 
    element: 'Fire', 
    color: '#F39C12',
    symbol: '🦁',
    description: [
      'Basic nature: Fixed fire sign ruled by the Sun; proud, expressive, creative, regal.',
      'Core qualities: Natural leadership, generosity, dramatic flair, desire for recognition, but vulnerable to ego and need for admiration.',
      'Life themes: Learning healthy self-expression, leading by heart not ego, cultivating confidence without arrogance, shining while allowing others to shine too.'
    ]
  },
  { 
    short: 'Vir', 
    name: 'Virgo', 
    sanskrit: 'Kanya', 
    element: 'Earth', 
    color: '#16A085',
    symbol: '👰',
    description: [
      'Basic nature: Dual earth sign ruled by Mercury; analytical, service-oriented, detail-focused, modest.',
      'Core qualities: Strong discrimination, love of organization, interest in health and improvement, but prone to worry, perfectionism, and criticism.',
      'Life themes: Serving with skill and humility, refining systems, balancing practicality with self-acceptance, and turning analysis into constructive action.'
    ]
  },
  { 
    short: 'Lib', 
    name: 'Libra', 
    sanskrit: 'Tula', 
    element: 'Air', 
    color: '#E67E22',
    symbol: '⚖️',
    description: [
      'Basic nature: Cardinal air sign ruled by Venus; diplomatic, relationship-oriented, aesthetic, fairness-seeking.',
      'Core qualities: Desire for harmony, teamwork, partnership, refinement in taste, yet indecisiveness or over-dependence on others for validation.',
      'Life themes: Building balanced relationships, learning to make decisions, integrating self-needs with others needs, and standing for justice and beauty.'
    ]
  },
  { 
    short: 'Sco', 
    name: 'Scorpio', 
    sanskrit: 'Vrishchika', 
    element: 'Water', 
    color: '#C0392B',
    symbol: '🦂',
    description: [
      'Basic nature: Fixed water sign traditionally ruled by Mars; intense, secretive, transformative.',
      'Core qualities: Emotional depth, investigative mind, magnetism, resilience, potential for jealousy, control issues, and extreme reactions.',
      'Life themes: Mastering transformation, handling power and intimacy wisely, healing through confronting shadows, and turning crises into growth.'
    ]
  },
  { 
    short: 'Sag', 
    name: 'Sagittarius', 
    sanskrit: 'Dhanu', 
    element: 'Fire', 
    color: '#8E44AD',
    symbol: '🏹',
    description: [
      'Basic nature: Dual fire sign ruled by Jupiter; philosophical, adventurous, expansive.',
      'Core qualities: Love of travel, learning, teaching, spiritual or moral exploration, but risk of restlessness, bluntness, or over-optimism.',
      'Life themes: Seeking higher truth, synthesizing knowledge into wisdom, cultivating faith with realism, and using freedom responsibly.'
    ]
  },
  { 
    short: 'Cap', 
    name: 'Capricorn', 
    sanskrit: 'Makara', 
    element: 'Earth', 
    color: '#2C3E50',
    symbol: '🐐',
    description: [
      'Basic nature: Cardinal earth sign ruled by Saturn; disciplined, ambitious, structured.',
      'Core qualities: Strong work ethic, strategic thinking, respect for tradition and hierarchy, yet tendency towards pessimism, rigidity, or workaholism.',
      'Life themes: Climbing long-term goals step by step, mastering responsibility and authority, and balancing material success with inner fulfillment.'
    ]
  },
  { 
    short: 'Aqu', 
    name: 'Aquarius', 
    sanskrit: 'Kumbha', 
    element: 'Air', 
    color: '#1ABC9C',
    symbol: '🏺',
    description: [
      'Basic nature: Fixed air sign ruled by Saturn in Vedic astrology; innovative, idealistic, group-oriented.',
      'Core qualities: Interest in social reform, technology, unconventional ideas, independence, but can become detached, rebellious, or overly theoretical.',
      'Life themes: Serving humanity through unique ideas, balancing individuality with community, and grounding ideals in practical change.'
    ]
  },
  { 
    short: 'Pis', 
    name: 'Pisces', 
    sanskrit: 'Meena', 
    element: 'Water', 
    color: '#6C3FB5',
    symbol: '🐟',
    description: [
      'Basic nature: Dual water sign ruled by Jupiter; spiritual, empathic, imaginative.',
      'Core qualities: Compassion, artistic sense, mystical or devotional inclination, but risk of escapism, confusion, or weak boundaries.',
      'Life themes: Developing faith and compassion while remaining grounded, using imagination for healing and creativity, and learning healthy boundaries in relationships.'
    ]
  }
];

// Planet Significance Data
const PLANET_INFO = {
  'Sun': { significance: 'Soul, vitality, father, authority, leadership, and self-expression.', icon: 'white-balance-sunny', color: '#F39C12' },
  'Moon': { significance: 'Mind, emotions, mother, nurturing, intuition, and public relations.', icon: 'moon-waning-crescent', color: '#4A90E2' },
  'Mars': { significance: 'Energy, courage, siblings, property, drive, and physical strength.', icon: 'sword-cross', color: '#E74C3C' },
  'Mercury': { significance: 'Intelligence, communication, business, education, and analytical skills.', icon: 'forum', color: '#27AE60' },
  'Jupiter': { significance: 'Wisdom, spirituality, children, wealth, luck, and higher learning.', icon: 'book-open-variant', color: '#F39C12' },
  'Venus': { significance: 'Love, beauty, relationships, luxury, marriage, and material comforts.', icon: 'heart', color: '#E91E63' },
  'Saturn': { significance: 'Discipline, karma, hard work, longevity, obstacles, and responsibilities.', icon: 'briefcase', color: '#2C3E50' },
  'Rahu': { significance: 'Desires, foreign lands, innovation, materialism, and sudden gains.', icon: 'ghost', color: '#9C27B0' },
  'Ketu': { significance: 'Spirituality, detachment, past life karma, liberation, and mysticism.', icon: 'eye-off', color: '#795548' }
};

export default function KundliViewScreen({ navigation, route }) {
  const [kundliData, setKundliData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState('');
  const [showZodiacDropdown, setShowZodiacDropdown] = useState(false);
  const [selectedZodiac, setSelectedZodiac] = useState(null);
  const [showPlanets, setShowPlanets] = useState(true);
  const [expandedPlanet, setExpandedPlanet] = useState(null);

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

      if (route.params?.kundliData) {
        console.log('Using kundli data from navigation params');
        setKundliData(route.params.kundliData);
        setLoading(false);
        return;
      }

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

  const getPlanetaryPositions = () => {
    if (!kundliData?.planetaryPositions) {
      console.warn('No planetaryPositions found');
      return [];
    }
    
    const planets = [];
    Object.entries(kundliData.planetaryPositions).forEach(([planetName, planetData]) => {
      if (planetData && typeof planetData === 'object') {
        let houseNum = 'N/A';
        if (kundliData?.houses && Array.isArray(kundliData.houses)) {
          const planetHouse = kundliData.houses.find(house => {
            if (house.planets_in_house && Array.isArray(house.planets_in_house)) {
              return house.planets_in_house.some(p => p.name === planetName);
            }
            return false;
          });
          if (planetHouse) {
            houseNum = planetHouse.house_number;
          }
        }

        planets.push({
          name: planetName,
          sign: planetData.sign || 'N/A',
          degree: planetData.degree ? `${planetData.degree.toFixed(2)}°` : 'N/A',
          house: houseNum,
          nakshatra: planetData.nakshatra?.formatted || 'N/A',
          retrograde: planetData.is_retrograde || false
        });
      }
    });
    return planets;
  };

  const getSunSign = () => {
    return kundliData?.kundli?.Sun?.D1?.sign || 'N/A';
  };

  const getMoonSign = () => {
    return kundliData?.kundli?.Moon?.D1?.sign || 'N/A';
  };

  const getAscendant = () => {
    if (!kundliData?.houses || !Array.isArray(kundliData.houses)) return 'N/A';
    
    const firstHouse = kundliData.houses.find(h => h.house_number === 1);
    return firstHouse?.sign_in_house || 'N/A';
  };

  const handleDownloadPDF = async () => {
    console.log('📥 PDF Download initiated');
    
    if (!kundliData?.id) {
      Alert.alert('Error', 'No Kundli data available');
      return;
    }

    try {
      const token = localStorage.getItem('@astroai_auth_token');
      if (!token) {
        Alert.alert('Error', 'Please log in again');
        return;
      }

      const API_URL = 'http://localhost:5000';
      const url = `${API_URL}/api/kundli/${kundliData.id}/pdf`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/pdf',
        },
      });

      if (response.status !== 200) {
        Alert.alert('Error', `Failed to download PDF (Status: ${response.status})`);
        return;
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `Kundli_${userName || 'User'}_${Date.now()}.pdf`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }, 100);
      
      Alert.alert('Success', 'PDF downloaded successfully!');
      
    } catch (err) {
      console.error('Download error:', err);
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

  const planetaryPositions = getPlanetaryPositions();
  const sunSign = getSunSign();
  const moonSign = getMoonSign();
  const ascendant = getAscendant();

  const birthName = kundliData?.birthDetails?.name || userName || 'N/A';
  const birthDate = kundliData?.birthDetails?.birth_date || 'N/A';
  const birthTime = kundliData?.birthDetails?.birth_time || 'N/A';
  const birthPlace = kundliData?.birthDetails?.birth_place || 'N/A';

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
        <MaterialCommunityIcons 
          name="download" 
          size={24} 
          color="#6C3FB5"
          style={styles.downloadButton}
          onPress={handleDownloadPDF}
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Birth Details</Text>
            <Divider style={styles.divider} />
            <DetailRow icon="account" label="Name" value={birthName} />
            <DetailRow icon="calendar" label="Date" value={birthDate} />
            <DetailRow icon="clock-outline" label="Time" value={birthTime} />
            <DetailRow icon="map-marker" label="Place" value={birthPlace} />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Primary Signs</Text>
            <Divider style={styles.divider} />
            <View style={styles.signsContainer}>
              <SignChip icon="white-balance-sunny" label="Sun Sign" value={sunSign} color="#F39C12" />
              <SignChip icon="moon-waning-crescent" label="Moon Sign" value={moonSign} color="#4A90E2" />
              <SignChip icon="arrow-up-circle" label="Ascendant" value={ascendant} color="#9B59B6" />
            </View>
          </Card.Content>
        </Card>

        {planetaryPositions.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>Rasi Chart (D1)</Text>
              <Divider style={styles.divider} />
              <View style={styles.chartContainer}>
                <RasiChart planets={planetaryPositions} houses={kundliData.houses || []} />
              </View>
              <Text style={styles.chartNote}>
                ⓘ Simplified birth chart showing planetary positions
              </Text>
            </Card.Content>
          </Card>
        )}

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.dropdownHeader}>
              <Text style={styles.cardTitle}>Zodiac Signs (Rashi) Guide</Text>
              <Button 
                mode="text" 
                compact
                onPress={() => setShowZodiacDropdown(!showZodiacDropdown)}
                icon={showZodiacDropdown ? "chevron-up" : "chevron-down"}
              >
                {showZodiacDropdown ? 'Hide' : 'Show'}
              </Button>
            </View>
            {showZodiacDropdown && (
              <>
                <Divider style={styles.divider} />
                <Text style={styles.helperText}>Select a sign to learn more:</Text>
                <View style={styles.zodiacButtonGrid}>
                  {ZODIAC_SIGNS.map((sign) => (
                    <Button
                      key={sign.short}
                      mode={selectedZodiac === sign.short ? "contained" : "outlined"}
                      onPress={() => setSelectedZodiac(selectedZodiac === sign.short ? null : sign.short)}
                      style={styles.zodiacButton}
                      compact
                    >
                      {sign.short}
                    </Button>
                  ))}
                </View>
                {selectedZodiac && (() => {
                  const sign = ZODIAC_SIGNS.find(z => z.short === selectedZodiac);
                  return (
                    <View style={styles.zodiacDetail}>
                      <View style={styles.zodiacDetailHeader}>
                        <Text style={[styles.zodiacSymbolLarge, { color: sign.color }]}>{sign.symbol}</Text>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text style={styles.zodiacDetailName}>{sign.name}</Text>
                          <Text style={styles.zodiacDetailSanskrit}>{sign.sanskrit}</Text>
                        </View>
                        <Chip style={{ backgroundColor: `${sign.color}15` }}>
                          {sign.element}
                        </Chip>
                      </View>
                      {sign.description.map((line, index) => (
                        <View key={index} style={styles.zodiacBulletPoint}>
                          <Text style={styles.zodiacBulletNumber}>{index + 1}.</Text>
                          <Text style={styles.zodiacDetailDesc}>{line}</Text>
                        </View>
                      ))}
                    </View>
                  );
                })()}
              </>
            )}
          </Card.Content>
        </Card>

        {planetaryPositions.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.dropdownHeader}>
                <Text style={styles.cardTitle}>Planetary Positions</Text>
                <Button 
                  mode="text" 
                  compact
                  onPress={() => setShowPlanets(!showPlanets)}
                  icon={showPlanets ? "chevron-up" : "chevron-down"}
                >
                  {showPlanets ? 'Hide' : 'Show'}
                </Button>
              </View>
              {showPlanets && (
                <>
                  <Divider style={styles.divider} />
                  <Text style={styles.helperText}>Tap on a planet to see its significance</Text>
                  {planetaryPositions.map((planet, index) => {
                    const info = PLANET_INFO[planet.name] || { significance: 'N/A', icon: 'circle', color: '#7F8C8D' };
                    const isExpanded = expandedPlanet === planet.name;
                    
                    return (
                      <View key={planet.name}>
                        <Button
                          mode="text"
                          onPress={() => setExpandedPlanet(isExpanded ? null : planet.name)}
                          style={styles.planetButton}
                          contentStyle={styles.planetButtonContent}
                          icon={isExpanded ? "chevron-up" : "chevron-down"}
                        >
                          <View style={styles.planetRowHeader}>
                            <MaterialCommunityIcons name={info.icon} size={20} color={info.color} style={{marginRight: 8}} />
                            <View style={styles.planetInfo}>
                              <Text style={styles.planetName}>{planet.name}{planet.retrograde ? ' ®' : ''}</Text>
                              <Text style={styles.planetDetails}>{planet.sign} • House {planet.house}</Text>
                            </View>
                            <Text style={styles.planetDegree}>{planet.degree}</Text>
                          </View>
                        </Button>
                        {isExpanded && (
                          <View style={styles.planetExpanded}>
                            <Text style={styles.planetSignificance}>📌 {info.significance}</Text>
                            {planet.nakshatra !== 'N/A' && (
                              <Text style={styles.planetNakshatra}>⭐ Nakshatra: {planet.nakshatra}</Text>
                            )}
                          </View>
                        )}
                        {index < planetaryPositions.length - 1 && <Divider style={styles.planetDivider} />}
                      </View>
                    );
                  })}
                </>
              )}
            </Card.Content>
          </Card>
        )}

        {kundliData.dashas?.current && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>Current Dasha Period</Text>
              <Divider style={styles.divider} />
              <View style={styles.dashaContainer}>
                <View style={styles.dashaRow}>
                  <Text style={styles.dashaLabel}>Mahadasha:</Text>
                  <Chip style={styles.dashaChip}>
                    {kundliData.dashas.current.mahadasha?.lord || 'N/A'}
                  </Chip>
                </View>
                <View style={styles.dashaRow}>
                  <Text style={styles.dashaLabel}>Antardasha:</Text>
                  <Chip style={styles.dashaChip}>
                    {kundliData.dashas.current.antardasha?.antardasha_lord || 'N/A'}
                  </Chip>
                </View>
                {kundliData.dashas.current.mahadasha?.start_date && (
                  <View style={styles.dashaPeriod}>
                    <MaterialCommunityIcons name="calendar-range" size={16} color="#7F8C8D" />
                    <Text style={styles.dashaPeriodText}>
                      {kundliData.dashas.current.mahadasha.start_date} - {kundliData.dashas.current.mahadasha.end_date}
                    </Text>
                  </View>
                )}
              </View>
            </Card.Content>
          </Card>
        )}

        <View style={styles.actionButtons}>
          <Button mode="contained" icon="download" style={styles.actionButton} onPress={handleDownloadPDF}>
            Download PDF
          </Button>
          <Button mode="outlined" icon="share-variant" style={styles.actionButton} onPress={handleShare}>
            Share
          </Button>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

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

function RasiChart({ planets, houses }) {
  const houseNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  
  // Zodiac sign symbols/logos
  const SIGN_SYMBOLS = {
    'Aries': '♈', 'Taurus': '♉', 'Gemini': '♊', 'Cancer': '♋',
    'Leo': '♌', 'Virgo': '♍', 'Libra': '♎', 'Scorpio': '♏',
    'Sagittarius': '♐', 'Capricorn': '♑', 'Aquarius': '♒', 'Pisces': '♓',
    'Ari': '♈', 'Tau': '♉', 'Gem': '♊', 'Can': '♋',
    'Leo': '♌', 'Vir': '♍', 'Lib': '♎', 'Sco': '♏',
    'Sag': '♐', 'Cap': '♑', 'Aqu': '♒', 'Pis': '♓'
  };
  
  const planetsByHouse = {};
  
  if (Array.isArray(houses)) {
    houses.forEach(house => {
      if (house.planets_in_house && Array.isArray(house.planets_in_house)) {
        planetsByHouse[house.house_number] = house.planets_in_house.map(p => 
          p.name.substring(0, 3)
        );
      }
    });
  }

  return (
    <Svg width={CHART_SIZE} height={CHART_SIZE}>
      {houseNumbers.map((houseNum, index) => {
        const row = Math.floor(index / 3);
        const col = index % 3;
        const cellSize = CHART_SIZE / 3;
        const x = col * cellSize;
        const y = row * cellSize;

        const houseData = Array.isArray(houses) 
          ? houses.find(h => h.house_number === houseNum)
          : null;
        const sign = houseData?.sign_in_house || 'N/A';
        const signSymbol = SIGN_SYMBOLS[sign] || SIGN_SYMBOLS[sign.substring(0, 3)] || '○';

        return (
          <G key={houseNum}>
            {/* House borders */}
            <Line x1={x} y1={y} x2={x + cellSize} y2={y} stroke="#E0E0E0" strokeWidth="2" />
            <Line x1={x + cellSize} y1={y} x2={x + cellSize} y2={y + cellSize} stroke="#E0E0E0" strokeWidth="2" />
            <Line x1={x + cellSize} y1={y + cellSize} x2={x} y2={y + cellSize} stroke="#E0E0E0" strokeWidth="2" />
            <Line x1={x} y1={y + cellSize} x2={x} y2={y} stroke="#E0E0E0" strokeWidth="2" />
            
            {/* House number - smaller, top-left corner */}
            <SvgText x={x + 8} y={y + 16} fontSize="11" fill="#7F8C8D" fontWeight="bold">
              {houseNum}
            </SvgText>
            
            {/* Zodiac symbol - large, centered top */}
            <SvgText 
              x={x + cellSize / 2} 
              y={y + 35} 
              fontSize="28" 
              fill="#6C3FB5" 
              textAnchor="middle"
              fontWeight="bold"
            >
              {signSymbol}
            </SvgText>
            
            {/* Sign name - below symbol */}
            <SvgText 
              x={x + cellSize / 2} 
              y={y + 52} 
              fontSize="13" 
              fill="#6C3FB5"
              textAnchor="middle"
              fontWeight="600"
            >
              {sign.substring(0, 3)}
            </SvgText>
            
            {/* Planets - bottom area, larger text */}
            {planetsByHouse[houseNum] && planetsByHouse[houseNum].length > 0 && (
              <SvgText
                x={x + cellSize / 2}
                y={y + cellSize - 20}
                fontSize="14"
                fill="#2C3E50"
                fontWeight="bold"
                textAnchor="middle"
              >
                {planetsByHouse[houseNum].join(', ')}
              </SvgText>
            )}
          </G>
        );
      })}
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
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
  backButton: { padding: 4 },
  downloadButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#2C3E50' },
  content: { flex: 1, paddingHorizontal: 20 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  errorText: { fontSize: 16, color: '#7F8C8D', textAlign: 'center', marginTop: 16, marginBottom: 24 },
  generateButton: { borderRadius: 8, paddingHorizontal: 24 },
  card: { marginTop: 16, borderRadius: 12, backgroundColor: '#FFFFFF', elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#2C3E50', marginBottom: 12 },
  divider: { marginBottom: 16 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  detailLabel: { flexDirection: 'row', alignItems: 'center' },
  detailLabelText: { fontSize: 14, color: '#7F8C8D', marginLeft: 8 },
  detailValue: { fontSize: 14, fontWeight: '600', color: '#2C3E50' },
  signsContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 8
  },
  signChip: { 
    flexBasis: '30%',
    minWidth: 100,
    alignItems: 'center', 
    marginHorizontal: 4,
    marginVertical: 4
  },
  signIcon: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 6
  },
  signLabel: { 
    fontSize: 10, 
    color: '#7F8C8D', 
    marginBottom: 2
  },
  signValue: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#2C3E50' 
  },
  chartContainer: { alignItems: 'center', marginVertical: 16 },
  chartNote: { fontSize: 12, color: '#7F8C8D', textAlign: 'center', marginTop: 12, fontStyle: 'italic' },
  dropdownHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  helperText: { fontSize: 13, color: '#7F8C8D', marginBottom: 12 },
  zodiacButtonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  zodiacButton: { flexBasis: '22%', minWidth: 70 },
  zodiacDetail: { marginTop: 12, padding: 12, backgroundColor: '#F8F9FA', borderRadius: 8 },
  zodiacDetailHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  zodiacDetailIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  zodiacDetailIconText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  zodiacSymbolIcon: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  zodiacSymbolLarge: { fontSize: 40, fontWeight: 'bold', marginRight: 8 },
  zodiacDetailName: { fontSize: 16, fontWeight: 'bold', color: '#2C3E50' },
  zodiacDetailSanskrit: { fontSize: 12, color: '#7F8C8D', fontStyle: 'italic' },
  zodiacBulletPoint: { flexDirection: 'row', marginTop: 8, paddingRight: 8 },
  zodiacBulletNumber: { fontSize: 13, fontWeight: 'bold', color: '#6C3FB5', marginRight: 6, minWidth: 18 },
  zodiacDetailDesc: { fontSize: 13, color: '#34495E', lineHeight: 19, flex: 1 },
  planetButton: { marginHorizontal: -16, borderRadius: 0 },
  planetButtonContent: { justifyContent: 'flex-start', paddingVertical: 4 },
  planetRowHeader: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  planetInfo: { flex: 1 },
  planetName: { fontSize: 15, fontWeight: '600', color: '#2C3E50', marginBottom: 2 },
  planetDetails: { fontSize: 13, color: '#7F8C8D' },
  planetDegree: { fontSize: 14, fontWeight: '600', color: '#6C3FB5' },
  planetExpanded: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#F8F9FA', borderRadius: 8, marginTop: 8, marginBottom: 8 },
  planetSignificance: { fontSize: 13, color: '#34495E', lineHeight: 19, marginBottom: 6 },
  planetNakshatra: { fontSize: 12, color: '#6C3FB5', fontStyle: 'italic' },
  planetDivider: { marginVertical: 4 },
  dashaContainer: { marginTop: 8 },
  dashaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  dashaLabel: { fontSize: 14, color: '#7F8C8D' },
  dashaChip: { backgroundColor: '#E3F2FD' },
  dashaPeriod: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8, padding: 12, backgroundColor: '#F5F5F5', borderRadius: 8 },
  dashaPeriodText: { fontSize: 13, color: '#2C3E50', marginLeft: 8 },
  actionButtons: { marginTop: 16, gap: 12 },
  actionButton: { borderRadius: 8, marginBottom: 8 },
  bottomPadding: { height: 40 },
});