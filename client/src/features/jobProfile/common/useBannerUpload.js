import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { uploadImageFile } from '../../community/common/imageUpload';
import { describeError } from '../../settings/components/SettingsUi';

// Changing or removing the banner picture of the signed-in member's profile. A new picture is uploaded first and the
// profile is saved with its id; a failure at either step is shown as a message and leaves the old banner in place.
export default function useBannerUpload(editor) {
  const { enqueueSnackbar } = useSnackbar();
  const [isBusy, setBusy] = useState(false);

  const run = async (task) => {
    setBusy(true);
    try {
      await task();
    } catch (error) {
      enqueueSnackbar(describeError(error), { variant: 'error' });
    } finally {
      setBusy(false);
    }
  };

  return {
    isBusy,
    change: (file) => run(async () => editor.saveBannerImage((await uploadImageFile(file)).id)),
    remove: () => run(() => editor.saveBannerImage('')),
  };
}
