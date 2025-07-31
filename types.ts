export interface Thread {
  id: string;
  title: string;
  lastUpdatedAt: string;
}

export interface UploadedConversation {
  id: string;
  threadId: string;
  title: string;
  content: string;
  uploadedAt: string;
}

export interface Message {
  role: 'user' | 'model';
  content: string;
}

// New types for Mabinogi data
export interface Character {
  id: string;
  name: string;
  subName: string;
  server: string;
  gold: number;
  fomorianTribute: number;
  fomorianTributeMax: number;
  silverCoins: number;
  silverCoinsMax: number;
}

export interface MabinogiData {
  characters: Character[];
  messages: Message[];
  inventory: Record<string, any>;
  craftingJobs: Record<string, any>;
}
