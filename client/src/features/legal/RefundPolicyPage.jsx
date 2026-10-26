import LegalLayout from './LegalLayout';
import { CONTACT_EMAIL, SITE_NAME } from './legalConfig';

const SECTIONS = [
  {
    title: 'Pro subscriptions (monthly and yearly)',
    body: [
      { list: [
        'Payments are processed securely by Razorpay in INR. Subscriptions renew automatically at the end of each billing period until cancelled.',
        'You can cancel at any time from your account. Cancellation stops future renewals; you keep Pro access until the end of the period you already paid for.',
        'Because Pro is a digital service that is available immediately, fees for a billing period that has started are not refundable.',
        'Exceptions: if you were charged twice for the same period, charged after a cancellation took effect, or a payment succeeded but Pro was not activated, tell us and we will fix it or refund the extra amount.',
      ] },
    ],
  },
  {
    title: 'Physical items (merchandise)',
    body: [
      { list: [
        'You can cancel an order yourself while it is in “placed” status. Once it is processing or shipped, contact us and we will cancel it if we have not dispatched it.',
        'Store items are bought with coins. A cancelled order is refunded in full as coins back to your wallet, and the item is restocked.',
        'If an item arrives damaged, defective or wrong, email us within 7 days of delivery with your order number and photos, and we will replace it or refund the coins.',
      ] },
    ],
  },
  {
    title: 'Courses and other digital items',
    body: [
      'Digital items are delivered to your account immediately, so they cannot be returned once access is given. If you could not get access because of a fault on our side, contact us and we will fix it or refund you (coins or money, as paid).',
    ],
  },
  {
    title: 'Coins and rewards',
    body: [
      'Coins and quest rewards are virtual, have no cash value and cannot be exchanged for money. Coins spent on a cancelled order are returned to your wallet.',
    ],
  },
  {
    title: 'How refunds are paid',
    body: [
      'Approved refunds of money (for Pro payments) go back to the original payment method through Razorpay, usually within 5 to 7 working days after approval, depending on your bank. Refunds for store orders are returned as coins to your wallet.',
    ],
  },
  {
    title: 'How to reach us',
    body: [
      `Email ${CONTACT_EMAIL} with your registered email and order or payment ID. We reply within 2 working days. This policy works together with the ${SITE_NAME} Terms of Service.`,
    ],
  },
];

export default function RefundPolicyPage() {
  return (
    <LegalLayout
      title="Refund & Cancellation Policy"
      intro="How cancellations and refunds work for Pro plans and store orders."
      sections={SECTIONS}
    />
  );
}
