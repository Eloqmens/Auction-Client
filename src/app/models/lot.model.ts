export interface LotImage {
  id: number;
  lotId: number;
  fileName: string;
  fileUrl: string;
  contentType: string;
  fileSize: number;
  isMain: boolean;
  createdAt: Date;
}

export interface Lot {
    id: number;
    title: string;
    description: string;
    startingPrice: number;
    currentPrice: number;
    endTime: Date;
    createdAt: Date;
    updatedAt: Date;
    categoryId: number;
    userId: string;
    category?: {
      id: number;
      name: string;
    };
    images?: LotImage[];
  }