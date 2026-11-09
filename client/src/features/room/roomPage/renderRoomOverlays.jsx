import AiAssistantDrawer from '../../workspace/AiAssistantDrawer';
import ConfirmDialog from '../../workspace/ConfirmDialog';
import FloatingCall from '../FloatingCall';
import InviteFriendsDialog from '../InviteFriendsDialog';
import PhoneProblemDescription from '../../workspace/PhoneProblemDescription';
import PhoneProblemList from '../../workspace/PhoneProblemList';
import ProblemListDrawer from '../../workspace/ProblemListDrawer';
import ProblemSheet from '../../workspace/ProblemSheet';
import { ProblemSkeletonBody } from '../../workspace/ProblemSkeleton';
import ShareSolutionDialog from '../../workspace/community/ShareSolutionDialog';

export function renderRoomOverlays(c) {
  const { aiOpen, call, closeDesc, confirm, descOpen, friend, friendsAnchor, goLogin, handleShared, hasProblem, isAuthenticated, isMobile, listOpen, nav, problem, room, roomId, runConfirm, setAiOpen, setConfirm, setFriendsAnchor, setListOpen, setShareOpen, shareOpen, sharedCode, showTags, slug, sub, switchProblem, switching } = c;
  return (
      <>
      {isAuthenticated && <InviteFriendsDialog anchorEl={friendsAnchor} onClose={() => setFriendsAnchor(null)} roomId={roomId} roomTitle={room.meta.title || problem?.title} />}

      {/* Problem list overlay: picking one switches the problem for BOTH of you */}
      {isMobile ? (
        <PhoneProblemList open={listOpen} onOpen={() => setListOpen(true)} onClose={() => setListOpen(false)} currentSlug={slug} onSelect={switchProblem} disabled={switching} />
      ) : (
        <ProblemListDrawer open={listOpen} onClose={() => setListOpen(false)} currentSlug={slug} onSelect={switchProblem} disabled={switching} />
      )}

      {/* Phone: the problem statement as a sheet sliding up (see useDescPanel) */}
      <ProblemSheet open={descOpen} onClose={closeDesc}>
        {problem ? <PhoneProblemDescription problem={problem} showTags={showTags} nav={nav} /> : <ProblemSkeletonBody />}
      </ProblemSheet>

      {hasProblem && (
        <AiAssistantDrawer
          key={slug}
          welcomeNote="This chat is private to you."
          open={aiOpen}
          onClose={() => setAiOpen(false)}
          slug={slug}
          language={room.language}
          getCode={sharedCode}
          isAuthenticated={isAuthenticated}
          onSignIn={goLogin}
        />
      )}

      {hasProblem && (
        <ShareSolutionDialog open={shareOpen} onClose={() => setShareOpen(false)} slug={slug} defaultSubmissionId={sub.result?._id} onShared={handleShared} />
      )}

      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.type === 'reset' ? 'Reset the shared code?' : 'Replace the shared code?'}
        text={`${confirm?.type === 'reset' ? 'The editor goes back to the starter template' : 'The editor will be replaced with this solution'} for you and ${friend?.name || 'your partner'}.`}
        confirmLabel={confirm?.type === 'reset' ? 'Reset' : 'Replace'}
        onCancel={() => setConfirm(null)}
        onConfirm={runConfirm}
      />

      {/* video call: floating circles, appears only while a call is on */}
      <FloatingCall call={call} friendName={friend?.name} myName={room.me?.name} hasFriend={!!friend} />
      </>
  );
}
