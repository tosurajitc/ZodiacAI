// typography.js

const typography = {
  // Font Families
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    light: 'System',
  },

  // Font Sizes
  fontSize: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    display: 32,
    hero: 40,
  },

  // Font Weights
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },

  // Letter Spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },

  // Text Styles (Pre-defined combinations)
  
  // Headings
  h1: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 1.2,
    letterSpacing: -0.5,
  },

  h2: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 1.3,
    letterSpacing: -0.5,
  },

  h3: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 1.3,
    letterSpacing: 0,
  },

  h4: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 1.4,
    letterSpacing: 0,
  },

  h5: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 1.4,
    letterSpacing: 0,
  },

  h6: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 1.5,
    letterSpacing: 0,
  },

  // Body text
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 1.5,
    letterSpacing: 0,
  },

  body: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 1.5,
    letterSpacing: 0,
  },

  bodySmall: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 1.5,
    letterSpacing: 0,
  },

  // Caption
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 1.4,
    letterSpacing: 0.5,
  },

  captionSmall: {
    fontSize: 10,
    fontWeight: '400',
    lineHeight: 1.4,
    letterSpacing: 0.5,
  },

  // Button text
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 1.2,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  buttonSmall: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 1.2,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Label
  label: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 1.4,
    letterSpacing: 0,
  },

  labelSmall: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 1.4,
    letterSpacing: 0,
  },

  // Overline (small uppercase text)
  overline: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 1.2,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // Subtitle
  subtitle1: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 1.5,
    letterSpacing: 0,
  },

  subtitle2: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 1.5,
    letterSpacing: 0,
  },

  // Link
  link: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 1.5,
    textDecorationLine: 'underline',
  },

  // Chat message
  chatMessage: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 1.5,
    letterSpacing: 0,
  },

  // Horoscope text
  horoscopeTitle: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 1.4,
    letterSpacing: 0,
  },

  horoscopeDescription: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 1.6,
    letterSpacing: 0,
  },

  // Planet name
  planetName: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 1.2,
    letterSpacing: 0.5,
  },

  // Chart label
  chartLabel: {
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 1.2,
    letterSpacing: 0.5,
  },

  // Score/Number (large display numbers)
  scoreDisplay: {
    fontSize: 40,
    fontWeight: '700',
    lineHeight: 1,
    letterSpacing: -1,
  },

  // Helper function to create custom text style
  createTextStyle: (fontSize, fontWeight, lineHeight, letterSpacing) => ({
    fontSize,
    fontWeight,
    lineHeight,
    letterSpacing,
  }),
};

export default typography;
