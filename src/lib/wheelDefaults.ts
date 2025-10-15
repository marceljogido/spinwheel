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
  centerText: 'SPIN!',
  spinAnimation: 'smooth',
  defaultColor: '#FFD700',
  showLabels: true,
  showImages: true,
  wheelSize: 340,
  showConfetti: true,
  showShake: true,
  showGlow: true,
  dummySegments: 0,
};

export const fallbackPrizes: Prize[] = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Free Coffee',
    color: '#8B4513',
    quota: 5,
    won: 0,
    winPercentage: 15
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    name: '10% Discount',
    color: '#FFD700',
    quota: 10,
    won: 0,
    winPercentage: 20
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    name: 'Free T-Shirt',
    color: '#4169E1',
    quota: 3,
    won: 0,
    winPercentage: 8
  },
  {
    id: '44444444-4444-4444-8444-444444444444',
    name: 'Gift Card $25',
    color: '#32CD32',
    quota: 2,
    won: 0,
    winPercentage: 5
  },
  {
    id: '55555555-5555-4555-8555-555555555555',
    name: 'Try Again',
    color: '#FF6347',
    quota: 20,
    won: 0,
    winPercentage: 45
  },
  {
    id: '66666666-6666-4666-8666-666666666666',
    name: 'VIP Access',
    color: '#9370DB',
    quota: 1,
    won: 0,
    winPercentage: 2
  }
];
