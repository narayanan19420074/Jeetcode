import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert, Box, Button, Chip, CircularProgress, Container, Pagination, Paper, Stack, Typography, alpha,
} from '@mui/material';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import CardGiftcardRoundedIcon from '@mui/icons-material/CardGiftcardRounded';
import { useSnackbar } from 'notistack';
import { storeApi } from '../../api/storeApi';
import { extractErrorMessage } from '../../api/apiClient';
import { userUpdated } from '../auth/authSlice';
import { Coins, fmt, fmtDateTime } from './storeUtils';

export default function WalletPage() {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [wallet, setWallet] = useState(null);
  const [tx, setTx] = useState(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const [claiming, setClaiming] = useState(false);

  const loadWallet = useCallback(() => {
    storeApi.wallet().then(({ data }) => {
      setWallet(data.data);
      dispatch(userUpdated({ coins: data.data.coins }));
    }).catch((err) => setError(extractErrorMessage(err)));
  }, [dispatch]);

  const loadTx = useCallback((p) => {
    storeApi.transactions({ page: p, limit: 15 }).then(({ data }) => setTx(data.data)).catch((err) => setError(extractErrorMessage(err)));
  }, []);

  useEffect(() => { loadWallet(); }, [loadWallet]);
  useEffect(() => { loadTx(page); }, [loadTx, page]);

  const claim = async () => {
    setClaiming(true);
    try {
      const { data } = await storeApi.claimDaily();
      enqueueSnackbar(`+${data.data.amount} coins claimed`, { variant: 'success' });
      setWallet(data.data.wallet);
      dispatch(userUpdated({ coins: data.data.wallet.coins }));
      if (page === 1) loadTx(1); else setPage(1);
    } catch (err) {
      enqueueSnackbar(extractErrorMessage(err), { variant: 'error' });
    } finally {
      setClaiming(false);
    }
  };

  if (!wallet && !error) return <Box sx={{ display: 'grid', placeItems: 'center', height: '50vh' }}><CircularProgress /></Box>;

  const d = wallet?.daily;
  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 } }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, flex: 1 }}>Wallet</Typography>
        <Button component={RouterLink} to="/store" startIcon={<StorefrontRoundedIcon />} variant="contained" disableElevation sx={{ fontWeight: 800 }}>Store</Button>
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {wallet && (
        <>
          <Paper variant="outlined" sx={(t) => ({ p: 3, borderRadius: 4, mb: 2, background: `linear-gradient(135deg, ${alpha(t.palette.warning.main, 0.18)}, transparent)` })}>
            <Typography variant="body2" color="text.secondary">Balance</Typography>
            <Coins value={wallet.coins} size={44} />
            <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
              <Chip label={`Earned ${fmt(wallet.earned)}`} variant="outlined" />
              <Chip label={`Spent ${fmt(wallet.spent)}`} variant="outlined" />
              <Chip icon={<LocalFireDepartmentRoundedIcon />} label={`${wallet.streakDays}-day streak`} variant="outlined" />
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, mb: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
              <CardGiftcardRoundedIcon color="warning" sx={{ fontSize: 36 }} />
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 800 }}>Daily check-in</Typography>
                <Typography variant="body2" color="text.secondary">
                  {d.claimed ? 'Claimed for today. Come back tomorrow to grow your streak.'
                    : d.eligible ? `Ready! Today's reward is ${d.reward} coins.`
                    : 'Solve 1 problem today to unlock your check-in.'}
                </Typography>
              </Box>
              {d.eligible ? (
                <Button variant="contained" disableElevation onClick={claim} disabled={claiming} sx={{ fontWeight: 800 }}>
                  {claiming ? <CircularProgress size={20} color="inherit" /> : `Claim ${d.reward}`}
                </Button>
              ) : !d.claimed ? (
                <Button component={RouterLink} to="/problems" variant="outlined" sx={{ fontWeight: 800 }}>Solve a problem</Button>
              ) : null}
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, mb: 2 }}>
            <Typography sx={{ fontWeight: 800, mb: 1 }}>Ways to earn</Typography>
            {wallet.earnWays.map((w, i) => (
              <Stack key={w.id} direction="row" spacing={2} alignItems="center" sx={{ py: 1, borderTop: i ? 1 : 0, borderColor: 'divider' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 700 }}>{w.title}</Typography>
                  <Typography variant="caption" color="text.secondary">{w.note}</Typography>
                </Box>
                {typeof w.coins === 'number' ? <Coins value={w.coins} /> : <Typography sx={{ fontWeight: 800, color: 'warning.main' }}>{w.coins}</Typography>}
              </Stack>
            ))}
          </Paper>
        </>
      )}

      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
        <Typography sx={{ fontWeight: 800, mb: 1 }}>Coin history</Typography>
        {!tx ? <CircularProgress size={22} /> : tx.items.length === 0 ? (
          <Typography color="text.secondary">No coins yet. Solve your first problem to start earning.</Typography>
        ) : (
          <>
            {tx.items.map((t, i) => (
              <Stack key={t.id} direction="row" spacing={2} alignItems="center" sx={{ py: 1.1, borderTop: i ? 1 : 0, borderColor: 'divider' }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600 }} noWrap>{t.title}</Typography>
                  <Typography variant="caption" color="text.secondary">{fmtDateTime(t.at)}</Typography>
                </Box>
                <Typography sx={{ fontWeight: 800, color: t.amount > 0 ? 'success.main' : 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
                  {t.amount > 0 ? '+' : '−'}{fmt(Math.abs(t.amount))}
                </Typography>
              </Stack>
            ))}
            {tx.pages > 1 && <Pagination sx={{ mt: 2, display: 'flex', justifyContent: 'center' }} count={tx.pages} page={page} onChange={(_, p) => setPage(p)} />}
          </>
        )}
      </Paper>
    </Container>
  );
}
