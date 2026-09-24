import { useState } from 'react';
import { Box, Stack, Typography, ButtonBase, Collapse, alpha } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';

// Inline quick-check under each concept's explanation.
// Retry until correct: once the user picks the right option, it locks and
// fires onCorrect() once — LearnTopicPage uses that to save the subsection
// to the backend. Wrong picks just mark that option red and let the user
// try again — this is formative, not graded.
export default function MicroCheck({ checkQuestion, onCorrect }) {
  const [selected, setSelected] = useState(null);
  const [solved, setSolved] = useState(false);
  const answered = selected !== null;

  const handlePick = (i) => {
    if (solved) return; // locked once correct
    setSelected(i);
    if (i === checkQuestion.correctIndex) {
      setSolved(true);
      onCorrect?.();
    }
  };

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: (t) => alpha(t.palette.primary.main, 0.02),
      }}
    >
      <Stack spacing={2}>
        <Box>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: 'primary.main',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontSize: 10.5,
            }}
          >
            Quick check
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 0.5, lineHeight: 1.4 }}>
            {checkQuestion.question}
          </Typography>
        </Box>

        <Stack spacing={1}>
          {checkQuestion.options.map((opt, i) => {
            const isThisCorrect = i === checkQuestion.correctIndex;
            const isThisSelected = i === selected;
            const showAsCorrect = solved && isThisCorrect;
            const showAsWrong = !solved && isThisSelected && !isThisCorrect;
            const dim = solved && !isThisCorrect;

            return (
              <ButtonBase
                key={i}
                disabled={solved}
                onClick={() => handlePick(i)}
                sx={{
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  p: 1.5,
                  borderRadius: 2,
                  border: '1.5px solid',
                  borderColor: showAsCorrect ? 'success.main' : showAsWrong ? 'error.main' : 'divider',
                  bgcolor: showAsCorrect
                    ? alpha('#10b981', 0.08)
                    : showAsWrong
                    ? alpha('#ef4444', 0.08)
                    : 'background.paper',
                  opacity: dim ? 0.55 : 1,
                  transition: 'all 0.2s ease',
                  '&:hover': !solved && { bgcolor: 'action.hover' },
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: '100%' }}>
                  <Box
                    sx={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 13,
                      fontWeight: 700,
                      flexShrink: 0,
                      border: '1.5px solid',
                      borderColor: showAsCorrect ? 'success.main' : showAsWrong ? 'error.main' : 'divider',
                      bgcolor: showAsCorrect ? 'success.main' : 'transparent',
                      color: showAsCorrect ? 'success.contrastText' : 'text.primary',
                    }}
                  >
                    {String.fromCharCode(65 + i)}
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, flexGrow: 1 }}>
                    {opt}
                  </Typography>
                  {showAsCorrect && <CheckCircleRoundedIcon fontSize="small" color="success" />}
                  {showAsWrong && <CancelRoundedIcon fontSize="small" color="error" />}
                </Stack>
              </ButtonBase>
            );
          })}
        </Stack>

        <Collapse in={solved}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              border: '1.5px solid',
              borderColor: 'success.main',
              bgcolor: alpha('#10b981', 0.08),
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5, color: 'success.main' }}>
              Correct!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {checkQuestion.explanation}
            </Typography>
          </Box>
        </Collapse>
      </Stack>
    </Box>
  );
}