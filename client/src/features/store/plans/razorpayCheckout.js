import { billingApi } from '../../../api/billingApi';
import { loadRazorpayScript } from '../../../api/loadRazorpayScript';
import { LIB_ACCENT } from '../../dashboard/components/libraryStyle';
import { PLAN_LABEL } from './planCatalog';

// Pro is only granted after the server has verified the signature Razorpay returns for the payment.
const verifyPayment = (response) =>
  billingApi.verify({
    razorpay_payment_id: response.razorpay_payment_id,
    razorpay_subscription_id: response.razorpay_subscription_id,
    razorpay_signature: response.razorpay_signature,
  });

function buildCheckoutOptions({ plan, subscriptionId, keyId, user, onPaid, onPaymentError, onDismiss }) {
  return {
    key: keyId,
    subscription_id: subscriptionId,
    name: 'JeetCode Pro',
    description: `${PLAN_LABEL[plan]} subscription`,
    theme: { color: LIB_ACCENT },
    prefill: { name: user?.name, email: user?.email },
    handler: (response) => verifyPayment(response).then(onPaid).catch(onPaymentError),
    modal: { ondismiss: onDismiss },
  };
}

export async function openSubscriptionCheckout({ plan, user, onPaid, onPaymentError, onDismiss }) {
  const scriptReady = await loadRazorpayScript();
  if (!scriptReady) throw new Error('Could not load the payment window. Check your connection and try again.');
  const { data } = await billingApi.checkout(plan);
  const { subscriptionId, keyId } = data.data;
  const options = buildCheckoutOptions({ plan, subscriptionId, keyId, user, onPaid, onPaymentError, onDismiss });
  new window.Razorpay(options).open();
}
