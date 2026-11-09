import { Box, InputAdornment, Stack, TextField, Typography, alpha } from '@mui/material';
import { ChatPanel } from '../FriendChat';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { EmptyNote, FilterChip, LiveLine, TabBar } from '../friendsKit';
import { FONT_SIZES, FONT_WEIGHTS, MOTION, RADII_PX, SHADOWS } from '../../../app/design/designTokens';
import IosShareRoundedIcon from '@mui/icons-material/IosShareRounded';
import LeaderboardRoundedIcon from '@mui/icons-material/LeaderboardRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SortRoundedIcon from '@mui/icons-material/SortRounded';
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';
import { WsIconButton } from '../../workspace/wsUi';
import { motion } from 'framer-motion';
import { surface } from '../../dashboard/dashboardUtils';
import { wsSurface } from '../../workspace/workspaceTheme';
import { REQUEST_TABS } from './friendsStyle';
import { InviteBanner } from './InviteBanner';

export function renderDesktopLayout(c) {
  const { body, chatActions, chatFriend, chatOverlay, codeTogether, desktop, fillH, filter, friends, goView, iconSize, inviteHandle, link, listRef, noFriends, onClearInvite, onListKey, onOpenLeaderboard, online, onlineCount, overlays, players, q, reduce, rootRef, searchRef, setFilter, setInviteAnchor, setPanelMode, setQ, setSortAnchor, showChips, showSearch, subtitle, tabs, title, toggleView, view } = c;
  return (
    <Stack
      ref={rootRef}
      spacing={2}
      sx={fillH ? { height: { xs: `calc(${fillH}px - 92px - env(safe-area-inset-bottom))`, md: `calc(${fillH}px - 24px)` } } : { minHeight: 480 }}
    >
      {inviteHandle && <InviteBanner handle={inviteHandle} onDone={onClearInvite} />}

      <Box sx={[surface, { flex: 1, minHeight: 0, overflow: 'hidden', display: 'grid', gridTemplateColumns: desktop ? '380px minmax(0, 1fr)' : 'minmax(0, 1fr)', gridTemplateRows: 'minmax(0, 1fr)' }]}>
        {/* ---------------- left: friends / requests / find */}
        <Box sx={(t) => ({ minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', borderRight: desktop ? `1px solid ${t.palette.divider}` : 'none' })}>
          {/* header: title + live count, quick icons */}
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', minHeight: 68, px: 2, pt: 1.5, pb: 1, flexShrink: 0 }}>
            <Box sx={{ minWidth: 0, flex: 1, pr: 1 }}>
              <motion.div key={title} initial={reduce ? false : { opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                <Typography noWrap sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.heading, lineHeight: 1.25, letterSpacing: -0.3 }}>{title}</Typography>
              </motion.div>
              <LiveLine text={subtitle} online={view === 'find' || view === 'activity' ? 0 : onlineCount} />
            </Box>
            <WsIconButton title="Find players" size={iconSize} active={view === 'find'} onClick={() => { toggleView('find'); setTimeout(() => searchRef.current?.focus(), 0); }}><PersonAddAlt1RoundedIcon /></WsIconButton>
            <WsIconButton title="Invite with link" size={iconSize} onClick={(e) => setInviteAnchor(e.currentTarget)}><IosShareRoundedIcon /></WsIconButton>
            <WsIconButton title="Friend activity" size={iconSize} active={view === 'activity'} onClick={() => toggleView('activity')}><TimelineRoundedIcon /></WsIconButton>
            <WsIconButton title="Friends leaderboard" size={iconSize} onClick={onOpenLeaderboard}><LeaderboardRoundedIcon /></WsIconButton>
          </Stack>

          {/* Friends / Friend requests / Sent requests, each with its own icon and count */}
          <Box sx={{ px: 2, pb: 1.5, flexShrink: 0 }}>
            <TabBar items={tabs} value={REQUEST_TABS.includes(view) ? view : ''} onChange={(key) => goView(key)} />
          </Box>

          {showSearch && (
            <Box sx={{ px: 2, pb: 1.5, flexShrink: 0 }}>
              <TextField
                fullWidth
                size="small"
                inputRef={searchRef}
                placeholder={view === 'find' ? 'Search all players by name or @handle' : 'Search by name or @handle'}
                value={q}
                onChange={(e) => setQ(e.target.value.slice(0, 40))}
                sx={(t) => ({
                  '& .MuiOutlinedInput-root': { height: 42, borderRadius: RADII_PX.card, bgcolor: wsSurface(t).raised, fontSize: FONT_SIZES.body, transition: `box-shadow ${MOTION.standard}ms` },
                  '& .MuiOutlinedInput-root.Mui-focused': { boxShadow: SHADOWS.ring(alpha(t.palette.primary.main, 0.45)) },
                  '& fieldset': { border: 'none' },
                })}
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ fontSize: FONT_SIZES.heading }} /></InputAdornment>,
                    endAdornment: q ? (
                      <InputAdornment position="end">
                        <WsIconButton title="Clear search" onClick={() => setQ('')} sx={{ width: 26, height: 26 }}><CloseRoundedIcon sx={{ fontSize: `${FONT_SIZES.title} !important` }} /></WsIconButton>
                      </InputAdornment>
                    ) : null,
                  },
                  htmlInput: { 'aria-label': 'Search friends or players', autoCapitalize: 'none', autoCorrect: 'off' },
                }}
              />
            </Box>
          )}

          {showChips && (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', px: 2, pb: 1.5, flexShrink: 0 }}>
              <FilterChip label="All" count={friends.length} active={filter === 'all'} onClick={() => setFilter('all')} />
              <FilterChip label="Online" dot count={onlineCount} active={filter === 'online'} onClick={() => setFilter('online')} />
              <Box sx={{ flex: 1 }} />
              <WsIconButton title="Sort" onClick={(e) => setSortAnchor(e.currentTarget)}><SortRoundedIcon /></WsIconButton>
            </Stack>
          )}

          <Box
            ref={listRef}
            className="autohide-scroll"
            onKeyDown={onListKey}
            sx={(t) => ({ flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain', borderTop: `1px solid ${t.palette.divider}`, pb: 2 })}
          >
            <motion.div key={`${view}:${filter}`} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.18 }}>
              {body}
            </motion.div>
          </Box>
        </Box>

        {/* ---------------- right: the chat (desktop) */}
        {desktop && (
          <Box sx={(t) => ({ minWidth: 0, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', bgcolor: wsSurface(t).panel })}>
            {chatFriend ? (
              <ChatPanel
                key={chatFriend.userId}
                friend={chatFriend}
                onCodeTogether={() => { setPanelMode('chat'); codeTogether(chatFriend, true); }}
                overlay={chatOverlay(chatFriend)}
                actions={chatActions(chatFriend)}
              />
            ) : (
              <Box sx={{ m: 'auto' }}>
                <EmptyNote icon={<ChatRoundedIcon />} title={noFriends ? 'No chats yet' : 'Your messages'}>
                  {noFriends ? 'Add a player from the list and your chat will open here.' : 'Pick a friend on the left to start chatting.'}
                </EmptyNote>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {overlays}
    </Stack>
  );

}
