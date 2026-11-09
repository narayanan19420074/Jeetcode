import { Box, IconButton, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { FONTS, FONT_SIZES, FONT_WEIGHTS } from '../../../app/design/designTokens';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import { LIB_ACCENT, libIconBtnSx } from '../../dashboard/components/libraryStyle';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import MinimizeRoundedIcon from '@mui/icons-material/MinimizeRounded';
import { PaneBar, WsButton, WsIconButton } from '../../workspace/wsUi';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import PhoneHeader from '../../workspace/PhoneHeader';
import PictureInPictureAltRoundedIcon from '@mui/icons-material/PictureInPictureAltRounded';
import { PresenceStack } from '../RoomParts';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import { tint } from '../../dashboard/dashboardUtils';

export function renderRoomHeader(c) {
  const { call, copyLink, ctl, displayName, friend, friendsAnchor, hasProblem, isAuthenticated, isMobile, leave, minimize, mobileItems, mobileView, openDesc, openMobileView, phoneMenu, pipOk, popOut, problem, room, roomId, setFriendsAnchor, setListOpen, showTags, toggleTags } = c;
  return (
      isMobile ? (
        <PhoneHeader
          problem={hasProblem ? problem : null}
          title={`${room.meta.title || problem?.title || 'Pair room'}${room.status === 'reconnecting' ? ' · Reconnecting…' : ''}`}
          tabs={mobileItems}
          view={mobileView}
          onView={openMobileView}
          onBack={minimize}
          backLabel="Minimize room"
          onOpenProblem={hasProblem && problem ? openDesc : undefined}
          chipsOn={showTags}
          onToggleChips={hasProblem ? toggleTags : undefined}
          menuItems={phoneMenu}
          trailing={
            <>
              <PresenceStack meName={room.me?.name || displayName} peers={room.peers} />
              <IconButton
                onClick={call.localStream ? call.stop : call.start}
                aria-label={call.localStream ? 'End video call' : 'Start video call'}
                aria-pressed={Boolean(call.localStream)}
                sx={[libIconBtnSx, Boolean(call.localStream) && { bgcolor: tint(LIB_ACCENT, 16), color: LIB_ACCENT, '&:hover': { bgcolor: tint(LIB_ACCENT, 16) } }]}
              >
                <VideocamRoundedIcon />
              </IconButton>
            </>
          }
        />
      ) : (
      <PaneBar
        height="auto"
        sx={{ minHeight: 48, pt: 'env(safe-area-inset-top)', px: { xs: 1, md: 1.5 }, gap: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <WsIconButton title="Problem list" size={ctl} onClick={() => setListOpen(true)}>
          <FormatListBulletedRoundedIcon />
        </WsIconButton>
        <Box sx={{ minWidth: 0, flex: 1, display: 'flex', alignItems: 'center', gap: 1, pl: { xs: 0.5, md: 0.5 } }}>
          <Typography noWrap sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.bodyLg }}>
            {room.meta.title || problem?.title || 'Pair room'}
          </Typography>
          <Typography noWrap sx={{ display: { xs: 'none', md: 'block' }, fontFamily: FONTS.mono, fontSize: FONT_SIZES.caption, color: 'text.disabled' }}>
            #{roomId}
          </Typography>
          {room.status === 'reconnecting' && (
            <Typography noWrap sx={{ fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.semibold, color: 'warning.main' }}>
              Reconnecting…
            </Typography>
          )}
        </Box>

        <PresenceStack meName={room.me?.name || displayName} peers={room.peers} />

        {isAuthenticated && (
          <WsIconButton title="Call a friend" size={ctl} active={Boolean(friendsAnchor)} onClick={(e) => setFriendsAnchor(e.currentTarget)}>
            <PersonAddAlt1RoundedIcon />
          </WsIconButton>
        )}
        {isMobile ? (
          <WsIconButton title="Invite link" size={ctl} onClick={copyLink}>
            <LinkRoundedIcon />
          </WsIconButton>
        ) : (
          <WsButton variant="secondary" startIcon={<LinkRoundedIcon />} onClick={copyLink}>
            Invite
          </WsButton>
        )}
        <WsIconButton
          title={call.localStream ? 'End video call' : 'Start video call'}
          size={ctl}
          active={Boolean(call.localStream)}
          onClick={call.localStream ? call.stop : call.start}
        >
          <VideocamRoundedIcon />
        </WsIconButton>
        {pipOk && call.localStream && (
          <WsIconButton title="Float the call circle over other tabs and apps" size={ctl} onClick={popOut}>
            <PictureInPictureAltRoundedIcon />
          </WsIconButton>
        )}
        <WsIconButton title="Minimize (keep the call in a small circle)" size={ctl} onClick={minimize}>
          <MinimizeRoundedIcon />
        </WsIconButton>
        <WsIconButton title="Close room" size={ctl} onClick={leave}>
          <CloseRoundedIcon />
        </WsIconButton>
      </PaneBar>
      )
  );
}
