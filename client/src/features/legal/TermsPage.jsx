import LegalLayout from './LegalLayout';
import { CONTACT_EMAIL, GOVERNING_COURTS, OPERATOR_NAME, SITE_NAME } from './legalConfig';

const SECTIONS = [
  {
    title: 'Agreement',
    body: [
      `By creating an account or using ${SITE_NAME} you agree to these Terms and to our Privacy Policy and Refund & Cancellation Policy. If you do not agree, please do not use the service. ${SITE_NAME} is operated by ${OPERATOR_NAME}.`,
    ],
  },
  {
    title: 'Eligibility and your account',
    body: [
      'You must be 18 or older, or use the service with a parent or guardian’s consent. You must give accurate information, keep your password safe, and are responsible for all activity under your account. One person, one account. Tell us at once if you suspect unauthorised access.',
    ],
  },
  {
    title: 'What the service offers',
    body: [
      `${SITE_NAME} provides coding problems, aptitude practice, company-prep roadmaps, study plans, contests, pair-coding rooms, community features, an optional store, and AI hints. We may add, change or remove features at any time. Practice content and AI hints are for learning and are provided “as is”; they do not guarantee any exam, interview or job result. AI replies can be wrong, so check them yourself.`,
    ],
  },
  {
    title: 'Acceptable use',
    body: [
      'You agree not to:',
      { list: [
        'cheat in contests or tests, share solutions during a live contest, or use multiple accounts to gain an advantage;',
        'submit code that attacks, overloads or tries to escape the judge or our servers, reads other users’ data, or accesses anything beyond solving the problem;',
        'scrape, copy or resell our problems, content or rankings, or use bots against the service;',
        'post unlawful, hateful, harassing, sexual, infringing or spam content, or impersonate others;',
        'interfere with the service, other users’ accounts or our security measures.',
      ] },
      'We may remove content, reset scores, suspend or terminate accounts that break these rules, with or without notice.',
    ],
  },
  {
    title: 'Your content',
    body: [
      'You own the code and content you submit. You give us a non-exclusive, worldwide, royalty-free licence to store, run, display and process it as needed to operate the service (for example, judging submissions and showing your public posts or solutions to others). You confirm you have the right to post it.',
    ],
  },
  {
    title: 'Our content',
    body: [
      `Problems, lessons, designs, software and branding on ${SITE_NAME} belong to us or our licensors. You may use them for your personal learning only. Company names and logos belong to their owners and are shown only to indicate where a question is tagged; this does not imply any affiliation or endorsement.`,
    ],
  },
  {
    title: 'Pro plans, coins and store',
    body: [
      { list: [
        'Pro is a paid subscription (monthly or yearly) billed through Razorpay and renews automatically until you cancel. Prices are shown in INR on the Pricing page and may change for future billing periods.',
        'You can cancel any time; Pro then continues until the end of the period already paid.',
        'Coins and quest rewards are virtual, have no cash value, cannot be transferred or exchanged for money, and may be adjusted or removed if earned through abuse.',
        'Store items (merchandise, courses and Pro days) are redeemed with coins and are subject to the Refund & Cancellation Policy.',
        'Contests with prizes may have their own rules, which are shown on the contest page and apply together with these Terms.',
      ] },
    ],
  },
  {
    title: 'Availability',
    body: [
      'We try to keep the service running but do not promise it will be uninterrupted or error-free. It may be unavailable for maintenance, updates or reasons outside our control.',
    ],
  },
  {
    title: 'Disclaimer and liability',
    body: [
      'The service is provided “as is” and “as available” without warranties of any kind, to the extent allowed by law. To the extent allowed by law, we are not liable for indirect or consequential loss, loss of data, or loss of opportunity, and our total liability for any claim is limited to the amount you paid us in the 12 months before the claim. Nothing here limits liability that cannot be limited by law.',
    ],
  },
  {
    title: 'Termination',
    body: [
      'You can stop using the service or ask us to delete your account at any time. We may suspend or end your access if you break these Terms or misuse the service. Sections that by their nature should continue (such as content licence, liability and governing law) survive termination.',
    ],
  },
  {
    title: 'Changes to these Terms',
    body: [
      'We may update these Terms. The “Last updated” date shows the current version. Continuing to use the service after a change means you accept it.',
    ],
  },
  {
    title: 'Governing law and contact',
    body: [
      `These Terms are governed by the laws of India. Courts at ${GOVERNING_COURTS} have exclusive jurisdiction, subject to any consumer rights you have under law. Questions or complaints: ${CONTACT_EMAIL}.`,
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      intro="Please read these terms before using the platform. They are the rules for using JeetCode."
      sections={SECTIONS}
    />
  );
}
