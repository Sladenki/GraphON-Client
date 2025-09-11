import React from 'react';

const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;

function normalizeUrl(possibleUrl: string): string {
  if (/^https?:\/\//i.test(possibleUrl)) return possibleUrl;
  return `https://${possibleUrl}`;
}

export function linkifyText(text: string): React.ReactNode[] {
  if (!text) return [];

  const lines = text.split(/\r?\n/);
  const nodes: React.ReactNode[] = [];

  lines.forEach((line, lineIndex) => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    line.replace(URL_REGEX, (match, _g1, offset: number) => {
      if (offset > lastIndex) {
        parts.push(line.slice(lastIndex, offset));
      }
      const href = normalizeUrl(match);
      parts.push(
        <a
          key={`lnk-${lineIndex}-${offset}`}
          href={href}
          target="_blank"
          rel="noopener noreferrer nofollow"
        >
          {match}
        </a>
      );
      lastIndex = offset + match.length;
      return match;
    });

    if (lastIndex < line.length) {
      parts.push(line.slice(lastIndex));
    }

    nodes.push(...parts);
    if (lineIndex < lines.length - 1) nodes.push(<br key={`br-${lineIndex}`} />);
  });

  return nodes;
}


