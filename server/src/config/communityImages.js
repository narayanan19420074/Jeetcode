// Post images are stored in MongoDB because the host disk is wiped on every deploy. The browser compresses each
// image before upload, so a typical image is a few hundred kilobytes.
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export const IMAGE_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// An image that is uploaded but never published (the author left the compose screen) is removed after a day.
export const UNATTACHED_IMAGE_TTL_SECONDS = 24 * 60 * 60;
export const MAX_PENDING_IMAGES_PER_USER = 20;

// A post references an uploaded image on its own line as ![](community-image:<id>). The client parses the same format.
export const IMAGE_REFERENCE = /!\[[^\]\n]*\]\(community-image:([a-f\d]{24})\)/gi;
