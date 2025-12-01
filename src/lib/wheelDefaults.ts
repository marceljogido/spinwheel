import type { Prize } from '@/types/prize';

export interface WheelConfig {
  centerText: string;
  spinAnimation: 'smooth' | 'bounce' | 'natural';
  defaultColor: string;
  showLabels: boolean;
  showImages: boolean;
  wheelSize: number;
  showConfetti: boolean;
  showShake: boolean;
  showGlow: boolean;
  dummySegments: number;
}

export const defaultWheelConfig: WheelConfig = {
  centerText: 'Veeam',
  spinAnimation: 'smooth',
  defaultColor: '#8dfca7',
  showLabels: true,
  showImages: false,
  wheelSize: 380,
  showConfetti: true,
  showShake: true,
  showGlow: true,
  dummySegments: 0,
};

export const fallbackPrizes: Prize[] = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Notebook',
    color: '#0f7c46',
    quota: 12,
    won: 0,
    winPercentage: 16,
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    name: 'SD Card Reader',
    color: '#1ba25c',
    quota: 10,
    won: 0,
    winPercentage: 16,
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    name: 'Nail Care Kit',
    color: '#4fd27c',
    quota: 10,
    won: 0,
    winPercentage: 16,
  },
  {
    id: '44444444-4444-4444-8444-444444444444',
    name: 'Charger Adapter',
    color: '#12894f',
    quota: 8,
    won: 0,
    winPercentage: 16,
  },
  {
    id: '55555555-5555-4555-8555-555555555555',
    name: 'Coffee Tumbler',
    color: '#30c06f',
    quota: 8,
    won: 0,
    winPercentage: 16,
  },
  {
    id: '66666666-6666-4666-8666-666666666666',
    name: 'Automatic Umbrella',
    color: '#8dfca7',
    quota: 10,
    won: 0,
    winPercentage: 20,
  },
];
