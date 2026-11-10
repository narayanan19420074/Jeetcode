import { useState } from 'react';
import { uploadImageFile } from './imageUpload';
import { MAX_POST_IMAGES } from './postImages';
import { extractErrorMessage } from '../../../api/apiClient';

// Images attached to the post being written. Each file is uploaded as soon as it is chosen, so publishing the post
// only has to reference them.
export default function useImageUploads({ images, setImages, setError }) {
  const [uploading, setUploading] = useState(false);

  const add = async (fileList) => {
    const files = Array.from(fileList).slice(0, MAX_POST_IMAGES - images.length);
    if (!files.length) return setError(`You can add up to ${MAX_POST_IMAGES} images to a post.`);
    setUploading(true);
    setError('');
    try {
      const uploaded = [];
      for (const file of files) uploaded.push(await uploadImageFile(file));
      setImages([...images, ...uploaded]);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const remove = (id) => setImages(images.filter((image) => image.id !== id));
  return { images, uploading, add, remove, canAddMore: images.length < MAX_POST_IMAGES };
}
