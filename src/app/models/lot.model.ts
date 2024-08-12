export interface Lot {
    id: number;
    title: string;
    description: string;
    startingPrice: number;
    currentPrice: number;
    endTime: Date;
    categoryId: number;
    userId: string;
  }