import { useState } from 'react';
import { useSelector } from 'react-redux';
import useJobProfile from './useJobProfile';
import { removeAt, upsertAt } from './jobProfileEntries';

// Which dialog is open: { kind: 'intro' | 'skills' } or { kind: 'entry' | 'remove', section, index }.
function useDialogState() {
  const [dialog, setDialog] = useState(null);
  return {
    dialog,
    closeDialog: () => setDialog(null),
    editIntro: () => setDialog({ kind: 'intro' }),
    editSkills: () => setDialog({ kind: 'skills' }),
    addEntry: (section) => setDialog({ kind: 'entry', section, index: null }),
    editEntry: (section, index) => setDialog({ kind: 'entry', section, index }),
    askRemoveEntry: (section, index) => setDialog({ kind: 'remove', section, index }),
  };
}

// Everything a Job profile screen needs (`readOnly` and `owner` match the member view, see useMemberJobProfile): the data, the open dialog, and one function per change.
export default function useJobProfileEditor() {
  const { profile, status, reload, save } = useJobProfile();
  const dialogState = useDialogState();
  const owner = useSelector((state) => state.auth.user);

  // Close only after the server accepted the change, so a failed save keeps the form open.
  const commit = async (changes) => {
    await save({ ...profile, ...changes });
    dialogState.closeDialog();
  };

  return {
    ...dialogState,
    readOnly: false,
    owner,
    profile,
    status,
    reload,
    saveIntro: (values) => commit(values),
    saveSkills: (skills) => commit({ skills }),
    saveBannerImage: (bannerImage) => commit({ bannerImage }),
    saveEntry: (section, index, entry) => commit({ [section]: upsertAt(profile[section], index, entry) }),
    removeEntry: (section, index) => commit({ [section]: removeAt(profile[section], index) }),
  };
}
