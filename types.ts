export type TaskType = 'receipt' | 'meeting' | 'sub';

export interface ReceiptLineItem {
  name: string;
  price: number;
  quantity?: number;
}

export interface ExtractedReceipt {
  id?: string;
  merchant: string;
  amount: number;
  currency: string;
  date: string;
  category: string;
  isSubscription: boolean;
  paymentMethod?: string;
  tax?: number;
  lineItems?: ReceiptLineItem[];
  notes?: string;
  rawSnippet?: string;
  createdAt?: string;
}

export interface MeetingActionItem {
  id: string;
  task: string;
  assignee: string;
  priority: 'High' | 'Medium' | 'Low';
  dueDate?: string;
  completed: boolean;
}

export interface ExtractedMeeting {
  id?: string;
  meetingTitle: string;
  date: string;
  summary: string;
  keyDecisions: string[];
  actionItems: MeetingActionItem[];
  followUpDate?: string;
  rawSnippet?: string;
  createdAt?: string;
}

export interface ExtractedSubscription {
  id: string;
  serviceName: string;
  cost: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly' | 'weekly' | 'quarterly';
  nextRenewalDate?: string;
  category: string;
  cancellationRecommendation: 'Cancel' | 'Keep' | 'Review / Downgrade';
  cancellationRationale: string;
  usageLikelihood: 'High' | 'Medium' | 'Low' | 'Dormant';
  howToCancel?: string;
  createdAt?: string;
}

export interface SubscriptionAnalysisResult {
  subscriptions: ExtractedSubscription[];
  totalMonthlyImpact: number;
  totalAnnualImpact: number;
  potentialSavings: number;
  summary: string;
}

export type AnalysisResult =
  | { type: 'receipt'; data: ExtractedReceipt; rawText: string; provider?: string; notice?: string }
  | { type: 'meeting'; data: ExtractedMeeting; rawText: string; provider?: string; notice?: string }
  | { type: 'sub'; data: SubscriptionAnalysisResult; rawText: string; provider?: string; notice?: string };