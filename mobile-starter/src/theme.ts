import { Platform, type TextStyle, type ViewStyle } from 'react-native';

export const colors = {
  ink: '#435171',
  muted: '#758096',
  line: '#e8eaf2',
  bg: '#fcfcff',
  white: '#ffffff',
  lavender: '#d2c9ff',
  blue: '#a9cfff',
  primary: '#566487',
  primaryPressed: '#465575',
  soft: '#edecf8',
  lilac: '#eee9fc',
  blueWash: '#e8edfc',
  placeholder: '#a0a7b7',
  label: '#7f89a0',
  kicker: '#9099ab',
  em: '#9390be',
  success: '#73907e',
  successBg: '#edf4ef',
  danger: '#a5657a',
  notice: '#8c7955',
  noticeBg: '#f5eedf',
  badge: '#9490b4',
  badgeBg: '#eeedf8',
};

export const serif = Platform.select({ ios: 'Georgia', default: 'serif' });

export const shadow: ViewStyle = {
  shadowColor: '#566487',
  shadowOpacity: 0.06,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 8 },
  elevation: 2,
};

export const type = {
  kicker: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.kicker,
  } satisfies TextStyle,
  h1: {
    fontFamily: serif,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '400',
    color: colors.ink,
    letterSpacing: -0.8,
  } satisfies TextStyle,
  serifTitle: {
    fontFamily: serif,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '400',
    color: colors.ink,
    letterSpacing: -0.4,
  } satisfies TextStyle,
};
