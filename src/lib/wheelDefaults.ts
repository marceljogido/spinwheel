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
  centerText: 'Movin',
  spinAnimation: 'smooth',
  defaultColor: '#cfd3dc',
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
    name: 'Handuk Eksklusif',
    color: '#1f4f9b',
    quota: 12,
    won: 0,
    winPercentage: 18,
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    name: 'Payung Movin',
    color: '#f5c33f',
    quota: 10,
    won: 0,
    winPercentage: 20,
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    name: 'Kipas Angin Mini',
    color: '#cfd3dc',
    quota: 8,
    won: 0,
    winPercentage: 16,
  },
  {
    id: '44444444-4444-4444-8444-444444444444',
    name: 'Coba Lagi',
    color: '#f2f2f2',
    quota: 30,
    won: 0,
    winPercentage: 30,
  },
  {
    id: '55555555-5555-4555-8555-555555555555',
    name: 'Anda Belum Beruntung',
    color: '#2c6eb6',
    quota: 25,
    won: 0,
    winPercentage: 16,
  },
];
