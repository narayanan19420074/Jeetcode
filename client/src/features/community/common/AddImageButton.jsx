import { useRef } from 'react';
import { IconButton } from '@mui/material';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import { ACCEPTED_IMAGE_TYPES } from './imageUpload';

// Opens the photo picker. The file input is hidden; the icon button is the control people see.
export default function AddImageButton({ uploads, disabled, sx }) {
  const inputRef = useRef(null);
  const handleChange = (event) => {
    uploads.add(event.target.files);
    event.target.value = '';
  };
  return (
    <>
      <IconButton aria-label="Add image" onClick={() => inputRef.current?.click()} disabled={disabled || uploads.uploading || !uploads.canAddMore} sx={sx}>
        <ImageOutlinedIcon />
      </IconButton>
      <input ref={inputRef} type="file" accept={ACCEPTED_IMAGE_TYPES.join(',')} multiple hidden onChange={handleChange} />
    </>
  );
}
