import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const Button = ({
  title,
  onPress,
  variant = 'primary', // primary, secondary, outline, text
  size = 'medium', // small, medium, large
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left', // left, right
  fullWidth = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = () => {
    const styles = [baseStyles.button, baseStyles[`button_${size}`]];
    
    if (fullWidth) styles.push(baseStyles.fullWidth);
    if (disabled) styles.push(baseStyles.disabled);
    if (style) styles.push(style);
    
    return styles;
  };

  const getTextStyle = () => {
    const styles = [baseStyles.text, baseStyles[`text_${size}`], baseStyles[`text_${variant}`]];
    
    if (disabled) styles.push(baseStyles.textDisabled);
    if (textStyle) styles.push(textStyle);
    
    return styles;
  };

  const renderContent = () => (
    <View style={baseStyles.contentContainer}>
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' ? '#fff' : '#667eea'} 
          size={size === 'small' ? 'small' : 'small'} 
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons 
              name={icon} 
              size={size === 'small' ? 16 : size === 'large' ? 24 : 20} 
              color={variant === 'primary' ? '#fff' : '#667eea'} 
              style={baseStyles.iconLeft} 
            />
          )}
          <Text style={getTextStyle()}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <Ionicons 
              name={icon} 
              size={size === 'small' ? 16 : size === 'large' ? 24 : 20} 
              color={variant === 'primary' ? '#fff' : '#667eea'} 
              style={baseStyles.iconRight} 
            />
          )}
        </>
      )}
    </View>
  );

  if (variant === 'primary' && !disabled) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={getButtonStyle()}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={baseStyles.gradient}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[getButtonStyle(), baseStyles[`button_${variant}`]]}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const baseStyles = StyleSheet.create({
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button_small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  button_medium: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  button_large: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  button_secondary: {
    backgroundColor: '#e0e7ff',
  },
  button_outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#667eea',
  },
  button_text: {
    backgroundColor: 'transparent',
  },
  gradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
  },
  text_small: {
    fontSize: 14,
  },
  text_medium: {
    fontSize: 16,
  },
  text_large: {
    fontSize: 18,
  },
  text_primary: {
    color: '#fff',
  },
  text_secondary: {
    color: '#667eea',
  },
  text_outline: {
    color: '#667eea',
  },
  text_text: {
    color: '#667eea',
  },
  textDisabled: {
    opacity: 0.7,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});

export default Button;
