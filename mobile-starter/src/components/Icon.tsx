import Svg, { Circle, Path, Rect } from 'react-native-svg';

import type { IconName } from '@/data/types';

type Props = { name: IconName; size?: number; color?: string };

export function Icon({ name, size = 22, color = '#435171' }: Props) {
  const stroke = {
    stroke: color,
    fill: 'none' as const,
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'sun' ? (
        <>
          <Circle cx={12} cy={12} r={4} stroke={color} fill="none" strokeWidth={1.7} />
          <Path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5" {...stroke} />
        </>
      ) : null}
      {name === 'memories' ? (
        <>
          <Rect x={4} y={5} width={16} height={15} rx={3} stroke={color} fill="none" strokeWidth={1.7} />
          <Path d="M8 3v4m8-4v4M4 10h16m-12 4h2m4 0h2m-8 3h2" {...stroke} />
        </>
      ) : null}
      {name === 'us' ? (
        <>
          <Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M15 3.13a4 4 0 0 1 0 7.75" {...stroke} />
          <Circle cx={9} cy={7} r={4} stroke={color} fill="none" strokeWidth={1.7} />
        </>
      ) : null}
      {name === 'arrow' ? <Path d="M5 12h14m-5-5 5 5-5 5" {...stroke} /> : null}
      {name === 'chevron' ? <Path d="m9 6 6 6-6 6" {...stroke} /> : null}
      {name === 'clock' ? (
        <>
          <Circle cx={12} cy={12} r={9} stroke={color} fill="none" strokeWidth={1.7} />
          <Path d="M12 7v5l3 2" {...stroke} />
        </>
      ) : null}
      {name === 'spark' ? <Path d="m12 2 2.7 7.3L22 12l-7.3 2.7L12 22l-2.7-7.3L2 12l7.3-2.7L12 2Z" {...stroke} /> : null}
      {name === 'check' ? <Path d="m5 12 4 4L19 6" {...stroke} /> : null}
      {name === 'lock' ? (
        <>
          <Rect x={5} y={10} width={14} height={11} rx={3} stroke={color} fill="none" strokeWidth={1.7} />
          <Path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" {...stroke} />
        </>
      ) : null}
      {name === 'heart' ? <Path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" {...stroke} /> : null}
      {name === 'leaf' ? <Path d="M20 3C9 2 3 6 5 14s15 8 15-11Z M4 21l12-13" {...stroke} /> : null}
      {name === 'close' ? <Path d="m6 6 12 12M6 18 18 6" {...stroke} /> : null}
      {name === 'question' ? (
        <>
          <Circle cx={12} cy={12} r={9} stroke={color} fill="none" strokeWidth={1.7} />
          <Path d="M9.5 8a2.5 2.5 0 0 1 5 .7c0 2-2.5 2-2.5 4m0 3v.1" {...stroke} />
        </>
      ) : null}
      {name === 'choice' ? <Path d="M5 4h4v4H5zm10 12h4v4h-4zM7 8v7a3 3 0 0 0 3 3h5m-8-6h7a3 3 0 0 0 3-3V4m-3 3 3-3 3 3" {...stroke} /> : null}
      {name === 'action' ? (
        <>
          <Circle cx={12} cy={12} r={9} stroke={color} fill="none" strokeWidth={1.7} />
          <Path d="m8 12 3 3 5-6" {...stroke} />
        </>
      ) : null}
      {name === 'book' ? <Path d="M12 5c-3-2-6-2-10-1v15c4-1 7-1 10 1 3-2 6-2 10-1V4c-4-1-7-1-10 1Zm0 0v15" {...stroke} /> : null}
    </Svg>
  );
}
