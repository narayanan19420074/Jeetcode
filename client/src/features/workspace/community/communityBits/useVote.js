import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import useSignInRedirect from './useSignInRedirect';
import { communityApi } from '../../../../api/communityApi';
import { extractErrorMessage } from '../../../../api/apiClient';

// Voting the same way twice removes the vote; the score changes by the difference between the old and new vote.
const nextVoteState = (previous, value) => {
  const myVote = previous.myVote === value ? 0 : value;
  return { myVote, score: previous.score + myVote - previous.myVote };
};

// Optimistic vote state: the score moves immediately and rolls back if the server rejects the vote.
export default function useVote({ targetType, targetId, score, myVote, isMine, onChange }) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const redirectToSignIn = useSignInRedirect();
  const [state, setState] = useState({ score, myVote });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    setState({ score, myVote });
  }, [score, myVote]);
  const cast = async (value) => {
    if (!isAuthenticated) return redirectToSignIn();
    if (busy || isMine) return;
    const optimistic = nextVoteState(state, value);
    setState(optimistic);
    setBusy(true);
    setError('');
    try {
      const { data } = await communityApi.vote(targetType, targetId, optimistic.myVote);
      setState(data.data);
      onChange?.(data.data.score, data.data.myVote);
    } catch (err) {
      setState(state);
      setError(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };
  return { state, error, cast };
}
