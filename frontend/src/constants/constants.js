// constants.js

// Zodiac Signs
export const ZODIAC_SIGNS = [
  { id: 1, name: 'Aries', symbol: '♈', element: 'Fire', ruler: 'Mars' },
  { id: 2, name: 'Taurus', symbol: '♉', element: 'Earth', ruler: 'Venus' },
  { id: 3, name: 'Gemini', symbol: '♊', element: 'Air', ruler: 'Mercury' },
  { id: 4, name: 'Cancer', symbol: '♋', element: 'Water', ruler: 'Moon' },
  { id: 5, name: 'Leo', symbol: '♌', element: 'Fire', ruler: 'Sun' },
  { id: 6, name: 'Virgo', symbol: '♍', element: 'Earth', ruler: 'Mercury' },
  { id: 7, name: 'Libra', symbol: '♎', element: 'Air', ruler: 'Venus' },
  { id: 8, name: 'Scorpio', symbol: '♏', element: 'Water', ruler: 'Mars' },
  { id: 9, name: 'Sagittarius', symbol: '♐', element: 'Fire', ruler: 'Jupiter' },
  { id: 10, name: 'Capricorn', symbol: '♑', element: 'Earth', ruler: 'Saturn' },
  { id: 11, name: 'Aquarius', symbol: '♒', element: 'Air', ruler: 'Saturn' },
  { id: 12, name: 'Pisces', symbol: '♓', element: 'Water', ruler: 'Jupiter' },
];

// Planets
export const PLANETS = [
  { id: 1, name: 'Sun', symbol: '☉', vedic: 'Surya', nature: 'Benefic' },
  { id: 2, name: 'Moon', symbol: '☽', vedic: 'Chandra', nature: 'Benefic' },
  { id: 3, name: 'Mars', symbol: '♂', vedic: 'Mangal', nature: 'Malefic' },
  { id: 4, name: 'Mercury', symbol: '☿', vedic: 'Budh', nature: 'Neutral' },
  { id: 5, name: 'Jupiter', symbol: '♃', vedic: 'Guru', nature: 'Benefic' },
  { id: 6, name: 'Venus', symbol: '♀', vedic: 'Shukra', nature: 'Benefic' },
  { id: 7, name: 'Saturn', symbol: '♄', vedic: 'Shani', nature: 'Malefic' },
  { id: 8, name: 'Rahu', symbol: '☊', vedic: 'Rahu', nature: 'Malefic' },
  { id: 9, name: 'Ketu', symbol: '☋', vedic: 'Ketu', nature: 'Malefic' },
];

// Nakshatras (Lunar Mansions)
export const NAKSHATRAS = [
  { id: 1, name: 'Ashwini', ruler: 'Ketu', pada: 4 },
  { id: 2, name: 'Bharani', ruler: 'Venus', pada: 4 },
  { id: 3, name: 'Krittika', ruler: 'Sun', pada: 4 },
  { id: 4, name: 'Rohini', ruler: 'Moon', pada: 4 },
  { id: 5, name: 'Mrigashira', ruler: 'Mars', pada: 4 },
  { id: 6, name: 'Ardra', ruler: 'Rahu', pada: 4 },
  { id: 7, name: 'Punarvasu', ruler: 'Jupiter', pada: 4 },
  { id: 8, name: 'Pushya', ruler: 'Saturn', pada: 4 },
  { id: 9, name: 'Ashlesha', ruler: 'Mercury', pada: 4 },
  { id: 10, name: 'Magha', ruler: 'Ketu', pada: 4 },
  { id: 11, name: 'Purva Phalguni', ruler: 'Venus', pada: 4 },
  { id: 12, name: 'Uttara Phalguni', ruler: 'Sun', pada: 4 },
  { id: 13, name: 'Hasta', ruler: 'Moon', pada: 4 },
  { id: 14, name: 'Chitra', ruler: 'Mars', pada: 4 },
  { id: 15, name: 'Swati', ruler: 'Rahu', pada: 4 },
  { id: 16, name: 'Vishakha', ruler: 'Jupiter', pada: 4 },
  { id: 17, name: 'Anuradha', ruler: 'Saturn', pada: 4 },
  { id: 18, name: 'Jyeshtha', ruler: 'Mercury', pada: 4 },
  { id: 19, name: 'Mula', ruler: 'Ketu', pada: 4 },
  { id: 20, name: 'Purva Ashadha', ruler: 'Venus', pada: 4 },
  { id: 21, name: 'Uttara Ashadha', ruler: 'Sun', pada: 4 },
  { id: 22, name: 'Shravana', ruler: 'Moon', pada: 4 },
  { id: 23, name: 'Dhanishta', ruler: 'Mars', pada: 4 },
  { id: 24, name: 'Shatabhisha', ruler: 'Rahu', pada: 4 },
  { id: 25, name: 'Purva Bhadrapada', ruler: 'Jupiter', pada: 4 },
  { id: 26, name: 'Uttara Bhadrapada', ruler: 'Saturn', pada: 4 },
  { id: 27, name: 'Revati', ruler: 'Mercury', pada: 4 },
];

// Houses (Bhavas)
export const HOUSES = [
  { id: 1, name: '1st House', area: 'Self, Personality, Physical Body' },
  { id: 2, name: '2nd House', area: 'Wealth, Family, Speech' },
  { id: 3, name: '3rd House', area: 'Courage, Siblings, Communication' },
  { id: 4, name: '4th House', area: 'Home, Mother, Peace of Mind' },
  { id: 5, name: '5th House', area: 'Children, Creativity, Intelligence' },
  { id: 6, name: '6th House', area: 'Health, Enemies, Service' },
  { id: 7, name: '7th House', area: 'Marriage, Partnership, Business' },
  { id: 8, name: '8th House', area: 'Longevity, Transformation, Secrets' },
  { id: 9, name: '9th House', area: 'Fortune, Religion, Higher Learning' },
  { id: 10, name: '10th House', area: 'Career, Status, Father' },
  { id: 11, name: '11th House', area: 'Gains, Friends, Desires' },
  { id: 12, name: '12th House', area: 'Losses, Spirituality, Foreign Lands' },
];

// Life Areas for Horoscope
export const LIFE_AREAS = [
  { id: 1, name: 'Finance', icon: '💰', color: '#4CAF50' },
  { id: 2, name: 'Career', icon: '💼', color: '#2196F3' },
  { id: 3, name: 'Relationship', icon: '❤️', color: '#E91E63' },
  { id: 4, name: 'Health', icon: '🏥', color: '#FF9800' },
];

// Remedy Categories
export const REMEDY_CATEGORIES = [
  { id: 1, name: 'Gemstones', icon: '💎' },
  { id: 2, name: 'Mantras', icon: '🕉️' },
  { id: 3, name: 'Rituals', icon: '🙏' },
  { id: 4, name: 'Lifestyle', icon: '🌱' },
];

// Subscription Plans
export const SUBSCRIPTION_PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'Forever',
    features: [
      '1 Kundli Generation',
      '5 AI Questions/Day',
      'Basic Daily Predictions',
      'Limited Chat History (7 days)',
    ],
    color: '#9E9E9E',
  },
  {
    id: 'monthly',
    name: 'Premium Monthly',
    price: 499,
    period: 'Per Month',
    features: [
      'Unlimited Kundli Generation',
      'Unlimited AI Questions',
      'Advanced Predictions',
      'Full Chat History',
      'PDF Downloads',
      'Compatibility Analysis',
      'Priority Support',
    ],
    color: '#9C27B0',
    recommended: true,
  },
  {
    id: 'yearly',
    name: 'Premium Yearly',
    price: 4999,
    period: 'Per Year',
    savings: '₹1,000 OFF',
    features: [
      'All Monthly Features',
      'Save ₹1,000/year',
      'Exclusive Yearly Reports',
      'Early Access to New Features',
    ],
    color: '#673AB7',
  },
];

// Question Templates
export const QUESTION_TEMPLATES = [
  'When should I change my job?',
  'Will I get married this year?',
  'What career is best for me?',
  'How is my financial situation?',
  'When will I get promotion?',
  'Is this a good time to invest?',
  'How is my relationship going?',
  'Will I travel abroad?',
];

// Feedback Categories
export const FEEDBACK_CATEGORIES = [
  { id: 1, name: 'Bug Report', icon: '🐛' },
  { id: 2, name: 'Feature Request', icon: '✨' },
  { id: 3, name: 'General Feedback', icon: '💬' },
  { id: 4, name: 'Prediction Accuracy', icon: '🎯' },
  { id: 5, name: 'UI/UX', icon: '🎨' },
];

// Chart Types
export const CHART_TYPES = [
  { id: 'rasi', name: 'Rasi Chart', description: 'Main birth chart (D1)' },
  { id: 'navamsa', name: 'Navamsa', description: 'Marriage & spiritual chart (D9)' },
  { id: 'bhava', name: 'Bhava Chalit', description: 'House cusp positions' },
];

// Dasha Systems
export const DASHA_SYSTEMS = [
  { id: 'vimshottari', name: 'Vimshottari Dasha', duration: 120, default: true },
  { id: 'yogini', name: 'Yogini Dasha', duration: 36 },
  { id: 'ashtottari', name: 'Ashtottari Dasha', duration: 108 },
];

// Time Periods for Yearly Horoscope
export const YEARLY_QUARTERS = [
  { id: 1, name: 'Q1', months: 'Jan - Mar', season: 'Winter' },
  { id: 2, name: 'Q2', months: 'Apr - Jun', season: 'Summer' },
  { id: 3, name: 'Q3', months: 'Jul - Sep', season: 'Monsoon' },
  { id: 4, name: 'Q4', months: 'Oct - Dec', season: 'Autumn' },
];

// App Theme Colors (matches theme/colors.js)
export const APP_COLORS = {
  primary: '#9C27B0',
  secondary: '#673AB7',
  accent: '#E91E63',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  error: '#F44336',
  success: '#4CAF50',
  warning: '#FF9800',
  info: '#2196F3',
  text: '#212121',
  textSecondary: '#757575',
};

// Indian States & UTs for Location Picker
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli',
  'Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh',
  'Lakshadweep', 'Puducherry',
];
