
// Type definitions for reward system components
export type Reward = {
  id: string;
  user_id: string;
  reward_type: string;
  amount: number;
  is_claimed: boolean;
  is_expired: boolean;
  created_at: string;
  expires_at: string | null;
  description: string | null;
  details: any | null;
};

export type Referral = {
  id: string;
  referrer_id: string;
  referred_id: string | null;
  status: string;
  reward_claimed: boolean;
  created_at: string;
  completed_at: string | null;
};

export type VIPTier = {
  id: number;
  name: string;
  required_points: number;
  cashback_percentage: number;
  weekly_bonus: number;
  description: string | null;
};

export type UserVIPStatus = {
  user_id: string;
  tier_id: number;
  points: number;
  last_calculated_at: string;
};

export type SupportTicket = {
  id: string;
  user_id: string;
  subject: string;
  description: string;
  category: string;
  status: string;
  created_at: string;
  updated_at: string;
  last_reply_at: string | null;
  last_reply_by: string | null;
};

export type AccountType = 'real' | 'demo' | 'influencer' | 'demo_influencer';

export type InfluencerStatus = {
  isInfluencer: boolean;
  referralCount: number;
  requiredReferrals: number;
  progress: number;
};
