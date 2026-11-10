import { useState } from 'react';
import { ACCEPTED_IMAGE_TYPES, uploadImageBlob, uploadImageFile } from './imageUpload';
import { MAX_POST_IMAGES } from './postImages';
import { extractErrorMessage } from '../../../api/apiClient';

// Images attached to the post being written. A chosen file first waits in `queue` until the author has cropped it (or
// chosen to keep it whole); it is uploaded then, so publishing the post only has to reference the images.
export default function useImageUploads({ images, setImages, setError }) {
  const [uploading, setUploading] = useState(false);
  const [queue, setQueue] = useState([]);

  const add = (fileList) => {
    const files = Array.from(fileList).slice(0, MAX_POST_IMAGES - images.length);
    if (!files.length) return setError(`You can add up to ${MAX_POST_IMAGES} images to a post.`);
    const supported = files.filter((file) => ACCEPTED_IMAGE_TYPES.includes(file.type));
    if (supported.length < files.length) setError('Only JPEG, PNG and WebP images are supported.');
    else setError('');
    setQueue(supported);
  };

  // The file leaves the queue whether the upload worked or not; a failed one has to be chosen again.
  const upload = async (task) => {
    setUploading(true);
    setError('');
    try {
      setImages([...images, await task()]);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setUploading(false);
      setQueue((previous) => previous.slice(1));
    }
  };

  const uploadCropped = (renderBlob) => upload(async () => uploadImageBlob(await renderBlob()));
  const uploadOriginal = () => upload(() => uploadImageFile(queue[0]));
  const remove = (id) => setImages(images.filter((image) => image.id !== id));
  return {
    images,
    uploading,
    add,
    remove,
    canAddMore: images.length < MAX_POST_IMAGES,
    pendingFile: queue[0] ?? null,
    pendingCount: queue.length,
    uploadCropped,
    uploadOriginal,
    skipPending: () => setQueue((previous) => previous.slice(1)),
  };
}
