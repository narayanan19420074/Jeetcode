import { Box, Paper, Typography, List, ListItemButton, Stack, alpha } from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CircleIcon from '@mui/icons-material/Circle';

// Left navigation rail for LearnTopicPage.
// Per-subsection status: check icon (done), filled blue dot (current),
// empty dot (not started). Sticky on md+, static on mobile.
export default function LearnSidebar({ sections, activeId, completedIds, onSelect }) {
  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        position: { md: 'sticky' },
        top: { md: 88 },
        maxHeight: { md: 'calc(100vh - 104px)' },
        overflowY: 'auto',
      }}
    >
      {sections.map((sec, secIdx) => (
        <Box key={sec.id}>
          <Typography
            variant="overline"
            sx={{
              display: 'block',
              fontWeight: 700,
              px: 2,
              pt: secIdx === 0 ? 2 : 2.5,
              pb: 0.5,
              color: 'text.secondary',
              letterSpacing: '0.08em',
              fontSize: 10.5,
              lineHeight: 1.2,
            }}
          >
            {sec.title}
          </Typography>
          <List dense disablePadding sx={{ pb: 1 }}>
            {sec.subsections.map((sub) => {
              const isActive = sub.id === activeId;
              const isDone = completedIds.includes(sub.id);
              return (
                <ListItemButton
                  key={sub.id}
                  selected={isActive}
                  onClick={() => onSelect(sub.id)}
                  sx={{
                    py: 0.75,
                    pl: 1.5,
                    borderLeft: '3px solid',
                    borderColor: isActive ? 'primary.main' : 'transparent',
                    '&.Mui-selected': {
                      bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                      '&:hover': { bgcolor: (t) => alpha(t.palette.primary.main, 0.12) },
                    },
                  }}
                >
                  <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0, width: '100%' }}>
                    {isDone ? (
                      <CheckRoundedIcon sx={{ fontSize: 15, color: 'success.main', flexShrink: 0 }} />
                    ) : (
                      <CircleIcon
                        sx={{
                          fontSize: 8,
                          color: isActive ? 'primary.main' : 'text.disabled',
                          flexShrink: 0,
                          ml: 0.5,
                          mr: 0.5,
                        }}
                      />
                    )}
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: 13,
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? 'text.primary' : 'text.secondary',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {sub.title}
                    </Typography>
                  </Stack>
                </ListItemButton>
              );
            })}
          </List>
        </Box>
      ))}
    </Paper>
  );
}