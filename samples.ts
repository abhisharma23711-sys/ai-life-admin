import { TaskType } from '../types';

export interface SamplePreset {
  title: string;
  description: string;
  text: string;
}

export const SAMPLES: Record<TaskType, SamplePreset[]> = {
  receipt: [
    {
      title: 'Netflix Subscription Receipt',
      description: 'Monthly streaming bill notification with card info',
      text: `Your Netflix Payment Receipt
Date: September 12, 2026
Account: user@example.com
Plan: Premium Ultra HD (4 Screens)
Billed to: Mastercard ending in 8842
Amount Charged: $22.99 USD
Next billing cycle will be: October 12, 2026.
Thank you for streaming with Netflix!`,
    },
    {
      title: 'Dinner & Drinks at Olive Bistro',
      description: 'Restaurant dining receipt with itemized line items and tip',
      text: `The Olive Bistro & Grill - Table 14
Date: 15 Sep 2026 8:45 PM
Server: Marco

2x Truffle Mushroom Risotto   $48.00
1x Burrata Caprese Salad      $16.50
2x San Pellegrino Sparkling    $9.00
1x Tiramisu House Specialty   $12.00
---------------------------------------
Subtotal:                     $85.50
Tax (8.875%):                  $7.59
Tip:                          $18.00
Total Paid:                  $111.09
Payment Method: Apple Pay (Visa 4021)`,
    },
    {
      title: 'Uber Airport Ride',
      description: 'Rideshare travel expense receipt',
      text: `Uber Trip Receipt - Sep 16, 2026
Pickup: 7:30 AM Downtown SFO
Dropoff: 8:15 AM San Francisco International Terminal 3
Trip Fare: $38.20
Tolls & Surcharges: $4.50
Driver Tip: $7.00
Total: $49.70 USD
Payment: Apple Pay (Amex ...1004)
Driver: David K. (Toyota Camry)`,
    },
  ],
  meeting: [
    {
      title: 'Q3 Product Roadmap & Sprint Planning',
      description: 'Cross-functional sync with tasks, dates, and decisions',
      text: `Weekly Product Alignment Sync - Sep 17, 2026
Attendees: Priya (Lead), Rohan (Frontend), Sarah (Backend), Mike (Design)

Summary:
Reviewed feedback on the new onboarding flow. Conversion dropped 4% on mobile due to long verification forms. Agreed to redesign step 2 to one-click social auth.

Decisions:
1. Deprecate SMS OTP in favor of WhatsApp and Google Authenticator by Oct 15.
2. Push the public beta launch from Sep 30 to Oct 12 to complete load testing.
3. Allocate $3,500 budget for automated Cypress testing infrastructure.

Action Items:
- Rohan: Implement simplified 1-step sign-up modal on web by Friday (Sep 20).
- Sarah: Prepare database migration script for OAuth tokens by Monday (Sep 23).
- Mike: Deliver mobile Figma components for dark mode & auth screen by Sep 19.
- Priya: Sync with legal compliance regarding European data privacy disclosure before Oct 5.
- Next follow-up meeting scheduled for Sep 24 at 10:00 AM.`,
    },
    {
      title: 'Marketing & Brand Launch Standup',
      description: 'Campaign kickoff with assignees and urgent deadlines',
      text: `Launch Campaign Standup - Monday Notes
Focus: Autumn Product Launch Campaign

Key takeaways:
- Ad creatives are 80% approved. Need final copy tweaks for LinkedIn Sponsored Posts.
- Influencer outreach has 14 confirmations out of 20 target tech creators.

Tasks:
- Elena: Finalize ad copy for LinkedIn & X campaign by tomorrow 5 PM (Sep 18).
- Dan: Ship the landing page countdown timer and email collection form by Wednesday (Sep 19).
- Aisha: Send product review sample kits to Tier-1 creators by Sep 21.
- Elena: Setup Google Analytics 4 conversion tracking events by Sep 20.`,
    },
  ],
  sub: [
    {
      title: 'Bank Statement - Multiple Subscriptions',
      description: 'Recurring monthly debits and underutilized software',
      text: `Checking Account Statement Excerpt (Sep 1 - Sep 15, 2026):

09/02/2026 - AUTOPAY ADOBE CREATIVE CLOUD - $59.99 (Monthly)
Notes: Haven't opened Photoshop in 3 months since moving team to Figma.

09/05/2026 - RECURRING DEBIT SPOTIFY PREMIUM FAMILY - $19.99 (Monthly)
Notes: Used daily by all 4 family members. Keep active.

09/08/2026 - EQUINOX FITNESS ALL-ACCESS - $280.00 (Monthly)
Notes: Only visited twice last month due to travel. Local gym down the block is $65/mo.

09/11/2026 - DROPBOX PLUS 2TB STORAGE - $11.99 (Monthly)
Notes: Migrated most archives to Google Drive (already paying for Google One 2TB at $9.99). Redundant!

09/14/2026 - CHATGPT PLUS SUBSCRIPTION - $20.00 (Monthly)
Notes: Essential for daily research and coding assistance.`,
    },
    {
      title: 'Single SaaS Renewal Warning',
      description: 'Upcoming annual enterprise software renewal',
      text: `Notice of Upcoming Automatic Renewal:
Service: Notion AI Team Workspace (Annual Plan)
Renewal Date: October 01, 2026
Renewal Charge: $240.00 / year (billed as 1 lump sum)
Payment Card: Visa ending in 9102
User feedback: Only 2 out of 8 team members enabled the AI add-on. We could downgrade to the standard Team plan at $120/yr and save 50%.`,
    },
  ],
};