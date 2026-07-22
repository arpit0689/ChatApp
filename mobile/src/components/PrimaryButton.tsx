import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

type Props = Omit<PressableProps, 'style'> & {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  style?: StyleProp<ViewStyle>;
};

export function PrimaryButton({ title, loading, variant = 'primary', disabled, style, ...props }: Props) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      {...props}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.text}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    marginVertical: 6,
  },
  primary: {
    backgroundColor: '#4f46e5',
  },
  secondary: {
    backgroundColor: '#0f172a',
  },
  danger: {
    backgroundColor: '#dc2626',
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
