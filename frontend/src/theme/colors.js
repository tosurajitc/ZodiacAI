import { MD3LightTheme } from 'react-native-paper';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6C3FB5',        // Purple
    secondary: '#4A90E2',      // Blue
    tertiary: '#9B59B6',       // Light Purple
    background: '#F5F5F5',     // Light Gray
    surface: '#FFFFFF',        // White
    error: '#E74C3C',          // Red
    success: '#27AE60',        // Green
    warning: '#F39C12',        // Orange
    text: '#2C3E50',           // Dark Gray
    textSecondary: '#7F8C8D',  // Medium Gray
    border: '#E0E0E0',         // Light Border
    gradient: ['#6C3FB5', '#4A90E2'], // Purple to Blue
  },
  roundness: 12,
  animation: {
    scale: 1.0,
  },
};

export default theme;
