import { Box, ButtonBase, Tooltip, Typography } from '@mui/material';
import { PLAN_AMBER } from '../../../studyplan/planUtils';
import { EMERALD, FAINT } from './railTokens';

function DayNumber({ day, active, today, future, label }) {
  return (
    <Box
      aria-label={label}
      sx={{
        position: 'absolute',
        left: '50%',
        top: 0,
        transform: 'translateX(-50%)',
        width: 34,
        height: 34,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.8rem',
        fontVariantNumeric: 'tabular-nums',
        fontWeight: active || today ? 800 : 500,
        color: active ? EMERALD : future ? FAINT : '#fff',
        border: today ? '2px solid' : 'none',
        borderColor: PLAN_AMBER,
      }}
    >
      {day}
    </Box>
  );
}

// Small "P" on the last day of a study plan.
function PlanMarker() {
  return (
    <Box
      component="span"
      aria-hidden="true"
      sx={{ position: 'absolute', top: -2, right: 'calc(50% - 20px)', width: 13, height: 13, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 8, fontWeight: 800, lineHeight: 1, bgcolor: PLAN_AMBER, color: '#1B1200' }}
    >
      P
    </Box>
  );
}

function PlanList({ plans }) {
  return (
    <Box>
      {plans.map((p) => (
        <Typography key={p.id} variant="caption" sx={{ display: 'block', fontWeight: 600 }}>
          {p.title} - {p.left}
        </Typography>
      ))}
    </Box>
  );
}

const describeDay = ({ day, today, active, hasPlan }) =>
  `${day}${today ? ', today' : ''}${active ? ', active' : ''}${hasPlan ? ', study plan: open' : ''}`;

export default function DayCell({ day, active, today, future, plans, onOpenPlans }) {
  const hasPlan = Boolean(plans && plans.length > 0);
  const cell = (
    <Box
      {...(hasPlan && { component: ButtonBase, onClick: (e) => onOpenPlans(plans, e.currentTarget) })}
      sx={{ position: 'relative', display: 'block', width: '100%', height: 34, cursor: hasPlan ? 'pointer' : 'default' }}
    >
      <DayNumber day={day} active={active} today={today} future={future} label={describeDay({ day, today, active, hasPlan })} />
      {hasPlan && <PlanMarker />}
    </Box>
  );
  if (!hasPlan) return cell;
  return (
    <Tooltip arrow title={<PlanList plans={plans} />}>
      {cell}
    </Tooltip>
  );
}
