import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';

type CardVariant = 'elevated' | 'outlined' | 'filled';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  style,
  contentStyle,
}) => {
  const getCardStyle = () => {
    switch (variant) {
      case 'elevated':
        return styles.elevatedCard;
      case 'outlined':
        return styles.outlinedCard;
      case 'filled':
        return styles.filledCard;
      default:
        return styles.elevatedCard;
    }
  };

  return (
    <View style={[styles.card, getCardStyle(), style]}>
      <View style={[styles.cardContent, contentStyle]}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 0,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
  },
  elevatedCard: {
    backgroundColor: '#FFFFFF',
    // For iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // For Android
    elevation: 4,
  },
  outlinedCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filledCard: {
    backgroundColor: '#F5F5F5',
  },
});

export default Card;
