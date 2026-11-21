import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { billingApi } from '../../../api/billingApi';
import { extractErrorMessage } from '../../../api/apiClient';
import { isRecurringPlan } from './planCatalog';
import { openSubscriptionCheckout } from './razorpayCheckout';

function useBillingStatus(isAuthenticated) {
  const [status, setStatus] = useState(null);
  const refreshStatus = useCallback(async () => {
    const { data } = await billingApi.status();
    setStatus(data.data);
  }, []);
  useEffect(() => {
    if (isAuthenticated) refreshStatus().catch(() => {});
  }, [isAuthenticated, refreshStatus]);
  return { status, refreshStatus };
}

function useSubscribe({ isAuthenticated, user, setError }) {
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState(null);

  const subscribe = async (plan) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/plans' } });
      return;
    }
    setError(null);
    setLoadingPlan(plan);
    try {
      await openSubscriptionCheckout({
        plan,
        user,
        onPaid: () => navigate('/dashboard'),
        onPaymentError: (err) => setError(extractErrorMessage(err)),
        onDismiss: () => setLoadingPlan(null),
      });
    } catch (err) {
      setError(err.message || extractErrorMessage(err));
    } finally {
      setLoadingPlan(null);
    }
  };
  return { loadingPlan, subscribe };
}

// Cancelling keeps Pro until the end of the paid period (the server cancels at cycle end), so the status is reloaded afterwards.
function useCancelSubscription({ refreshStatus, setError }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const confirm = async () => {
    setIsCancelling(true);
    setError(null);
    try {
      await billingApi.cancel();
      await refreshStatus();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsOpen(false);
      setIsCancelling(false);
    }
  };
  const close = () => !isCancelling && setIsOpen(false);
  return { isOpen, isCancelling, open: () => setIsOpen(true), close, confirm };
}

// Everything the Plans page needs: the current plan, the checkout flow and the cancel flow.
export default function usePlansBilling() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [error, setError] = useState(null);
  const { status, refreshStatus } = useBillingStatus(isAuthenticated);
  const checkout = useSubscribe({ isAuthenticated, user, setError });
  const cancel = useCancelSubscription({ refreshStatus, setError });
  const isPro = Boolean(status?.isPro ?? user?.isPro);
  return { isAuthenticated, status, isPro, isRecurring: isRecurringPlan(status?.proPlan), error, clearError: () => setError(null), cancel, ...checkout };
}
