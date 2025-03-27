import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps
} from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'text';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
  ...rest
}) => {
  const getButtonStyle = () => {
    let buttonStyle: ViewStyle = { ...styles.button };
    
    // Variant styles
    switch (variant) {
      case 'primary':
        buttonStyle = { ...buttonStyle, ...styles.primaryButton };
        break;
      case 'secondary':
        buttonStyle = { ...buttonStyle, ...styles.secondaryButton };
        break;
      case 'outline':
        buttonStyle = { ...buttonStyle, ...styles.outlineButton };
        break;
      case 'danger':
        buttonStyle = { ...buttonStyle, ...styles.dangerButton };
        break;
      case 'success':
        buttonStyle = { ...buttonStyle, ...styles.successButton };
        break;
      case 'text':
        buttonStyle = { ...buttonStyle, ...styles.textButton };
        break;
    }
    
    // Size styles
    switch (size) {
      case 'small':
        buttonStyle = { ...buttonStyle, ...styles.smallButton };
        break;
      case 'medium':
        buttonStyle = { ...buttonStyle, ...styles.mediumButton };
        break;
      case 'large':
        buttonStyle = { ...buttonStyle, ...styles.largeButton };
        break;
    }
    
    // Full width
    if (fullWidth) {
      buttonStyle = { ...buttonStyle, ...styles.fullWidth };
    }
    
    // Disabled state
    if (disabled || isLoading) {
      buttonStyle = { ...buttonStyle, ...styles.disabledButton };
    }
    
    return buttonStyle;
  };
  
  const getTextStyle = () => {
    let labelStyle: TextStyle = { ...styles.buttonText };
    
    // Variant text styles
    switch (variant) {
      case 'primary':
        labelStyle = { ...labelStyle, ...styles.primaryButtonText };
        break;
      case 'secondary':
        labelStyle = { ...labelStyle, ...styles.secondaryButtonText };
        break;
      case 'outline':
        labelStyle = { ...labelStyle, ...styles.outlineButtonText };
        break;
      case 'danger':
        labelStyle = { ...labelStyle, ...styles.dangerButtonText };
        break;
      case 'success':
        labelStyle = { ...labelStyle, ...styles.successButtonText };
        break;
      case 'text':
        labelStyle = { ...labelStyle, ...styles.textButtonText };
        break;
    }
    
    // Size text styles
    switch (size) {
      case 'small':
        labelStyle = { ...labelStyle, ...styles.smallButtonText };
        break;
      case 'medium':
        labelStyle = { ...labelStyle, ...styles.mediumButtonText };
        break;
      case 'large':
        labelStyle = { ...labelStyle, ...styles.largeButtonText };
        break;
    }
    
    // Disabled state
    if (disabled) {
      labelStyle = { ...labelStyle, ...styles.disabledButtonText };
    }
    
    return labelStyle;
  };
  
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      style={[getButtonStyle(), style]}
      activeOpacity={0.7}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' || variant === 'text' ? '#3F51B5' : '#FFFFFF'} 
        />
      ) : (
        <>
          {leftIcon && <Text style={styles.iconLeft}>{leftIcon}</Text>}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
          {rightIcon && <Text style={styles.iconRight}>{rightIcon}</Text>}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  // Variants
  primaryButton: {
    backgroundColor: '#3F51B5',
    borderWidth: 0,
  },
  secondaryButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 0,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3F51B5',
  },
  dangerButton: {
    backgroundColor: '#F44336',
    borderWidth: 0,
  },
  successButton: {
    backgroundColor: '#4CAF50',
    borderWidth: 0,
  },
  textButton: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 8,
  },
  // Variant text styles
  primaryButtonText: {
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#333333',
  },
  outlineButtonText: {
    color: '#3F51B5',
  },
  dangerButtonText: {
    color: '#FFFFFF',
  },
  successButtonText: {
    color: '#FFFFFF',
  },
  textButtonText: {
    color: '#3F51B5',
  },
  // Sizes
  smallButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  mediumButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  largeButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  // Size text styles
  smallButtonText: {
    fontSize: 12,
  },
  mediumButtonText: {
    fontSize: 14,
  },
  largeButtonText: {
    fontSize: 16,
  },
  // States
  disabledButton: {
    opacity: 0.6,
  },
  disabledButtonText: {
    opacity: 0.8,
  },
  // Width
  fullWidth: {
    width: '100%',
  },
  // Icon styles
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});

export default Button;
