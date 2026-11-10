export const MAX_POST_IMAGES = 4;

// A post stores each uploaded image on its own line as ![](community-image:<id>); the server reads the same format.
const IMAGE_LINE = /^!\[([^\]]*)\]\(community-image:([a-f\d]{24})\)\s*$/i;

export const imageMarkdown = (id) => `![](community-image:${id})`;

// Images follow the written text, each in its own paragraph.
export const appendImages = (body, images) => [body, ...images.map((image) => imageMarkdown(image.id))].filter(Boolean).join('\n\n');

// Splits a post into text chunks and image lines. Lines inside a fenced code block are code, never images.
export function splitPostBody(source) {
  const segments = [];
  let textLines = [];
  let insideFence = false;
  const flushText = () => {
    if (textLines.length) segments.push({ type: 'text', text: textLines.join('\n') });
    textLines = [];
  };
  source.split('\n').forEach((line) => {
    if (line.startsWith('```')) insideFence = !insideFence;
    const image = insideFence ? null : line.match(IMAGE_LINE);
    if (!image) {
      textLines.push(line);
      return;
    }
    flushText();
    segments.push({ type: 'image', id: image[2], alt: image[1] });
  });
  flushText();
  return segments;
}
