import { useState } from 'react';
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';
import { WsButton } from '../wsUi';
import BugReportDialog from './BugReportDialog';
import useBugReport from './useBugReport';

// "Report a bug" entry at the bottom left of the desktop workspace. The form starts empty each time it is opened.
export default function BugReportButton({ slug }) {
  const [open, setOpen] = useState(false);
  const report = useBugReport(slug);

  const close = () => {
    setOpen(false);
    report.reset();
  };

  return (
    <>
      <WsButton variant="ghost" startIcon={<BugReportOutlinedIcon />} onClick={() => setOpen(true)}>
        Report a bug
      </WsButton>
      <BugReportDialog open={open} onClose={close} report={report} />
    </>
  );
}
