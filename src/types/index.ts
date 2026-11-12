export interface LimitOption {
  amount: number;
  fee: number;
  originalFee?: number;
  badge?: string;
  badgeClass?: 'popular' | 'max' | 'premium';
}

export interface ProgramConfig {
  id: string;
  name: string;
  heroWords: [string, string];
  subtitle: string;
  cardTitle: string;
  description: string;
  provider: string;
  limits: LimitOption[];
}

export interface ApplicationData {
  id: string;
  programId: string;
  programName: string;
  targetLimit: number;
  fee: number;
  idNumber: string;
  phoneNumber: string;
  mpesaCode?: string;
  timestamp: number;
  status: 'PENDING_PAYMENT' | 'STK_SENT' | 'PAYMENT_VERIFIED' | 'REVIEW_APPROVED';
}

export interface RecentTransaction {
  id: string;
  phoneMasked: string;
  program: string;
  amount: number;
  timeAgo: string;
}
