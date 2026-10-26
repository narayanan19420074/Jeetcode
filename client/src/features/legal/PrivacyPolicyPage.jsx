import LegalLayout from './LegalLayout';
import { CONTACT_EMAIL, OPERATOR_NAME, OPERATOR_PLACE, SITE_NAME } from './legalConfig';

const SECTIONS = [
  {
    title: 'Who we are',
    body: [
      `${SITE_NAME} is a coding, aptitude and company-prep platform operated by ${OPERATOR_NAME}, ${OPERATOR_PLACE}. This policy explains what personal data we collect, why, and the choices you have. It is written to follow the Digital Personal Data Protection Act, 2023 and the Information Technology Act, 2000 (India).`,
    ],
  },
  {
    title: 'Data we collect',
    body: [
      { list: [
        'Account data: name, handle (public username), email, and a hashed password. If you sign in with Google, GitHub or LinkedIn we receive your name, email, profile picture and that provider’s account ID. We never see your provider password.',
        'Profile data you add: avatar and profile details.',
        'Learning activity: problems solved, code you submit, aptitude attempts and scores, streaks, quests, coins, study plans, contest entries and leaderboard position.',
        'Community content: posts, comments, votes, friend connections and direct messages you send on the platform.',
        'Orders and payments: for Pro plans we receive payment status and IDs from Razorpay. For physical items we collect your delivery name, phone number and address. We do not receive or store your card, UPI or bank details.',
        'Technical data: IP address, browser/device type and login session information, used for security, abuse prevention and keeping you signed in.',
      ] },
    ],
  },
  {
    title: 'Why we use it',
    body: [
      { list: [
        'To create your account, sign you in and keep it secure.',
        'To run the code you submit and show results, progress and rankings.',
        'To process payments, deliver orders and give you Pro access.',
        'To send service emails such as email verification and password reset.',
        'To provide AI hints you request, and to improve and fix the product.',
        'To detect abuse, cheating and fraud, and to meet legal obligations.',
      ] },
      'We do not sell your personal data and we do not show third-party advertising.',
    ],
  },
  {
    title: 'Who we share it with',
    body: [
      'We use trusted service providers who process data on our behalf, only as needed to run the service:',
      { list: [
        'Hosting and database: Render (application hosting) and MongoDB Atlas (database).',
        'Payments: Razorpay.',
        'Email delivery: Brevo.',
        'Sign-in: Google, GitHub and LinkedIn, if you choose to use them.',
        'Code execution: your submitted code is executed by our judge, which may be a third-party code-execution service such as Judge0.',
        'AI hints: when you use the AI assistant, your prompt and the code or problem you are working on are sent to an AI provider (Google Gemini or Anthropic) to generate a reply. Do not put sensitive personal information in AI prompts.',
      ] },
      'Some of these providers are located outside India, so your data may be processed in other countries. We may also disclose data if required by law or to protect the rights and safety of users and the service.',
      'Your handle, avatar, solved counts, leaderboard rank and community posts are visible to other users. Your email, address and phone number are not.',
    ],
  },
  {
    title: 'Cookies and local storage',
    body: [
      'We use a secure cookie to keep you signed in (refresh token) and your browser’s local storage for preferences such as theme, editor settings and saved drafts. These are essential to the service. We do not use advertising cookies.',
    ],
  },
  {
    title: 'How long we keep data',
    body: [
      'We keep your data while your account is active. If you delete your account or ask us to, we delete or anonymise your personal data within a reasonable period, except what we must keep for legal, tax, accounting or fraud-prevention reasons (for example, payment and order records). Backups and logs are removed on their normal cycle.',
    ],
  },
  {
    title: 'Security',
    body: [
      'Passwords are stored hashed, traffic uses HTTPS, and access to data is restricted. No system is perfectly secure, so we cannot guarantee absolute security. Please use a strong, unique password and tell us immediately if you suspect misuse of your account.',
    ],
  },
  {
    title: 'Your rights',
    body: [
      'Under applicable law you can ask to access, correct, update or erase your personal data, withdraw consent, and nominate someone to exercise these rights on your behalf. Email us at the address below and we will respond within a reasonable time, and in any case within 30 days.',
    ],
  },
  {
    title: 'Children',
    body: [
      `${SITE_NAME} is intended for users aged 18 and over. If you are under 18 you may use it only with the consent and supervision of a parent or legal guardian. If we learn that a child’s data was collected without such consent, we will delete it.`,
    ],
  },
  {
    title: 'Changes to this policy',
    body: [
      'We may update this policy from time to time. The “Last updated” date above shows the latest version. If a change is significant we will notify you on the site or by email.',
    ],
  },
  {
    title: 'Contact and grievances',
    body: [
      `For privacy questions, requests or complaints (including our grievance officer), contact ${OPERATOR_NAME} at ${CONTACT_EMAIL}. We acknowledge complaints within 72 hours and aim to resolve them within 15 days.`,
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      intro="Your privacy matters. This page explains in plain language what we collect and how we use it."
      sections={SECTIONS}
    />
  );
}
