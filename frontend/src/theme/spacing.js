// spacing.js

const spacing = {
  // Base unit (8px system)
  unit: 8,

  // Spacing scale
  xs: 4,    // Extra small - 4px
  sm: 8,    // Small - 8px
  md: 16,   // Medium - 16px
  lg: 24,   // Large - 24px
  xl: 32,   // Extra large - 32px
  xxl: 48,  // Double extra large - 48px
  xxxl: 64, // Triple extra large - 64px

  // Screen padding/margin
  screenHorizontal: 16,
  screenVertical: 20,

  // Card spacing
  cardPadding: 16,
  cardMargin: 12,
  cardRadius: 12,

  // Button spacing
  buttonPaddingVertical: 12,
  buttonPaddingHorizontal: 24,
  buttonRadius: 8,

  // Input spacing
  inputPaddingVertical: 12,
  inputPaddingHorizontal: 16,
  inputRadius: 8,
  inputMarginBottom: 16,

  // Icon sizes
  iconXS: 16,
  iconSM: 20,
  iconMD: 24,
  iconLG: 32,
  iconXL: 48,

  // Avatar sizes
  avatarSmall: 32,
  avatarMedium: 48,
  avatarLarge: 64,
  avatarXLarge: 96,

  // Section spacing
  sectionMarginBottom: 24,
  sectionPadding: 16,

  // List item spacing
  listItemPadding: 12,
  listItemMargin: 8,

  // Header/Footer heights
  headerHeight: 56,
  footerHeight: 60,
  tabBarHeight: 56,

  // Border radius variants
  radiusSmall: 4,
  radiusMedium: 8,
  radiusLarge: 12,
  radiusXLarge: 16,
  radiusRound: 999, // Fully rounded

  // Border widths
  borderThin: 1,
  borderMedium: 2,
  borderThick: 3,

  // Divider
  dividerHeight: 1,
  dividerMargin: 12,

  // Modal/Dialog
  modalPadding: 20,
  modalRadius: 16,

  // Bottom sheet
  bottomSheetRadius: 20,
  bottomSheetHandleWidth: 40,
  bottomSheetHandleHeight: 4,

  // Chart spacing
  chartPadding: 16,
  chartMargin: 20,

  // Horoscope card
  horoscopeCardPadding: 16,
  horoscopeCardMargin: 12,
  horoscopeCardRadius: 12,

  // Chat bubble
  chatBubblePadding: 12,
  chatBubbleRadius: 16,
  chatBubbleMargin: 8,

  // Helper function to multiply base unit
  multiply: (factor) => spacing.unit * factor,

  // Padding helper
  padding: (top, right, bottom, left) => ({
    paddingTop: top,
    paddingRight: right,
    paddingBottom: bottom,
    paddingLeft: left,
  }),

  // Margin helper
  margin: (top, right, bottom, left) => ({
    marginTop: top,
    marginRight: right,
    marginBottom: bottom,
    marginLeft: left,
  }),
};

export default spacing;