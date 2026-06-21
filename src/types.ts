export interface WebsiteCampaign {
  id: string;
  title: string;
  url: string;
  reward: number;
  timer: number;
  logo: string; // Icon name key
  category: 'Shopping' | 'Balita' | 'Teknolohiya' | 'E-Services' | 'Kultura';
  description: string;
  completed: boolean;
  mockPageContent: {
    heroTitle: string;
    heroSubtitle: string;
    primaryColor: string;
    accentColor: string;
    paragraphs: string[];
    features: string[];
    offers?: string[];
  };
}

export interface WithdrawalRequest {
  id: string;
  accountName: string;
  gcashNumber: string;
  amount: number;
  status: 'pending' | 'processing' | 'success' | 'failed';
  createdAt: string;
  referenceNo: string;
}

export interface ActivityLog {
  id: string;
  type: 'reward' | 'withdraw' | 'bonus';
  title: string;
  amount: number;
  timestamp: string;
  details: string;
}

export interface UserStats {
  balance: number;
  lifetimeEarnings: number;
  completedTasksCount: number;
  dailyCheckInDate: string | null;
}

export interface ReferralFriend {
  id: string;
  name: string;
  avatar: string;
  currentEarnings: number;
  bonusClaimed: boolean;
  joinedAt: string;
}

