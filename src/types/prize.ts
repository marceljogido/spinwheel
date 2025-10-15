export interface Prize {
  id: string;
  name: string;
  color: string;
  quota: number;
  won: number;
  winPercentage: number;
  image?: string;
  sortIndex?: number;
}
