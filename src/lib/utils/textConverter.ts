import { slug } from 'github-slugger';
import { marked } from "marked";

// slugify
export const slugify = (content: string) => {
  if (!content) return null;

  return slug(content);
};

// markdownify
export const markdownifyInline = (content: string) => {
  if (!content) return null;

  return marked.parseInline(content);
};

export const markdownify = (content: string) => {
  if (!content) return null;

  return marked.parse(content.replaceAll("\n", "<br>"));
};

// humanize
export const humanize = (content: string) => {
  if (!content) return null;

  return content
    .split('-')
    .map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join('');
};

// plainify
export const plainify = (content: string) => {
  if (!content) return null;

  const filterBrackets = content.replace(/<\/?[^>]+(>|$)/gm, "");
  const filterSpaces = filterBrackets.replace(/[\r\n]\s*[\r\n]/gm, "");
  const stripHTML = htmlEntityDecoder(filterSpaces);
  return stripHTML;
};

// despaceify
export const despaceify = (content: string) => {
  if (!content) return null;

  return content.replaceAll(' ', '');
};

// strip entities for plainify
const htmlEntityDecoder = (htmlWithEntities: string): string => {
  let entityList: { [key: string]: string } = {
    "&nbsp;": " ",
    "&lt;": "<",
    "&gt;": ">",
    "&amp;": "&",
    "&quot;": '"',
    "&#39;": "'",
  };
  let htmlWithoutEntities: string = htmlWithEntities.replace(
    /(&amp;|&lt;|&gt;|&quot;|&#39;)/g,
    (entity: string): string => {
      return entityList[entity];
    }
  );
  return htmlWithoutEntities;
};
