/**
 * Remark Plugin: JSX Sanitizer
 *
 * This plugin automatically sanitizes Markdown content that could be misinterpreted
 * as JSX by the MDX compiler. It preserves the content's meaning while preventing
 * build failures.
 *
 * Patterns handled:
 * - Angle-bracketed text like <Type>, <filename.ext>
 * - Generic type annotations like Record<string, any>
 * - Preserves comparison operators like <10, < 100
 */

const { visit } = require('unist-util-visit');

// Check if a string looks like a valid HTML tag
function isValidHtmlTag(tagName) {
  const htmlTags = [
    'a',
    'abbr',
    'address',
    'area',
    'article',
    'aside',
    'audio',
    'b',
    'base',
    'bdi',
    'bdo',
    'blockquote',
    'body',
    'br',
    'button',
    'canvas',
    'caption',
    'cite',
    'code',
    'col',
    'colgroup',
    'data',
    'datalist',
    'dd',
    'del',
    'details',
    'dfn',
    'dialog',
    'div',
    'dl',
    'dt',
    'em',
    'embed',
    'fieldset',
    'figcaption',
    'figure',
    'footer',
    'form',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'head',
    'header',
    'hr',
    'html',
    'i',
    'iframe',
    'img',
    'input',
    'ins',
    'kbd',
    'label',
    'legend',
    'li',
    'link',
    'main',
    'map',
    'mark',
    'meta',
    'meter',
    'nav',
    'noscript',
    'object',
    'ol',
    'optgroup',
    'option',
    'output',
    'p',
    'param',
    'picture',
    'pre',
    'progress',
    'q',
    'rp',
    'rt',
    'ruby',
    's',
    'samp',
    'script',
    'section',
    'select',
    'small',
    'source',
    'span',
    'strong',
    'style',
    'sub',
    'summary',
    'sup',
    'svg',
    'table',
    'tbody',
    'td',
    'template',
    'textarea',
    'tfoot',
    'th',
    'thead',
    'time',
    'title',
    'tr',
    'track',
    'u',
    'ul',
    'var',
    'video',
    'wbr',
  ];

  return htmlTags.includes(tagName.toLowerCase());
}

module.exports = () => (tree) => {
    // Visit all text nodes in the AST
    visit(tree, 'text', (node, index, parent) => {
      // Skip if we're inside a code block (those are already safe)
      if (parent && (parent.type === 'code' || parent.type === 'inlineCode')) {
        return;
      }

      const value = node.value;
      const matches = [];

      // Find problematic angle bracket patterns
      // We need to be careful not to match comparison operators
      const angleRegex = /<([^>]+)>/g;
      let match;

      while ((match = angleRegex.exec(value)) !== null) {
        const [fullMatch, innerContent] = match;
        const startIdx = match.index;

        // Check if this is a comparison operator (< followed by number)
        const beforeChar = startIdx > 0 ? value[startIdx - 1] : '';
        const afterChar =
          startIdx + fullMatch.length < value.length
            ? value[startIdx + fullMatch.length]
            : '';

        // Enhanced comparison detection
        const isComparison =
          /^\s*\d/.test(innerContent) || // "< 10" or "<10"
          /^=/.test(innerContent) || // "<="
          /^\s*=/.test(innerContent) || // "< ="
          (/\w$/.test(beforeChar) && /^\d/.test(innerContent)) || // "fieldCount<10"
          (/^\s*$/.test(innerContent) && /\d/.test(afterChar)); // "< " followed by number

        if (isComparison) {
          // This is a comparison operator, skip it
          continue;
        }

        // Check if it's a valid HTML tag
        const tagName = innerContent.split(/[\s\/]/)[0];
        if (isValidHtmlTag(tagName)) {
          // This is a valid HTML tag, skip it
          continue;
        }

        // Check if it looks like a React component (starts with uppercase)
        if (/^[A-Z]/.test(innerContent)) {
          // This might be an actual React component, be careful
          // Only sanitize if it's clearly not meant to be JSX
          if (!/^[A-Z]\w+(\s|\/|$|>)/.test(innerContent)) {
            matches.push({
              start: startIdx,
              end: startIdx + fullMatch.length,
              content: fullMatch, // Use full match to preserve angle brackets
              isWrapped: true,
            });
          }
        } else {
          // This is likely problematic content that needs sanitizing
          matches.push({
            start: startIdx,
            end: startIdx + fullMatch.length,
            content: fullMatch, // Use full match to preserve angle brackets
            isWrapped: true,
          });
        }
      }

      // Also find generic type patterns like Array<string>
      const genericRegex = /(\b\w+)<([^>]+)>/g;
      genericRegex.lastIndex = 0;

      while ((match = genericRegex.exec(value)) !== null) {
        const [fullMatch] = match;
        const startIdx = match.index;
        const endIdx = startIdx + fullMatch.length;

        // Check if this overlaps with any existing match
        const overlaps = matches.some(
          (m) =>
            (startIdx >= m.start && startIdx < m.end) ||
            (endIdx > m.start && endIdx <= m.end),
        );

        if (!overlaps) {
          matches.push({
            start: startIdx,
            end: endIdx,
            content: fullMatch,
            isWrapped: false, // Generic types don't need wrapping
          });
        }
      }

      // Find standalone less-than signs that might cause issues
      // This catches patterns like "< 10" that aren't inside angle brackets
      const standaloneRegex = /<\s*(\d+|=)/g;
      standaloneRegex.lastIndex = 0;

      while ((match = standaloneRegex.exec(value)) !== null) {
        const [fullMatch] = match;
        const startIdx = match.index;
        const endIdx = startIdx + fullMatch.length;

        // Check if this overlaps with any existing match
        const overlaps = matches.some(
          (m) =>
            (startIdx >= m.start && startIdx < m.end) ||
            (endIdx > m.start && endIdx <= m.end),
        );

        if (!overlaps) {
          // Don't add comparison operators to matches - they're safe
          // This regex is just for documentation purposes
          continue;
        }
      }

      // Sort matches by position
      matches.sort((a, b) => a.start - b.start);

      // Build new nodes if we have matches
      if (matches.length > 0) {
        const newNodes = [];
        let lastIndex = 0;

        for (const match of matches) {
          // Add text before the match
          if (match.start > lastIndex) {
            newNodes.push({
              type: 'text',
              value: value.slice(lastIndex, match.start),
            });
          }

          // Add the problematic content as inline code
          // For wrapped content (angle brackets), we already have the full match
          // For generic types, we use the content as-is
          newNodes.push({
            type: 'inlineCode',
            value: match.content,
          });

          lastIndex = match.end;
        }

        // Add remaining text after last match
        if (lastIndex < value.length) {
          newNodes.push({
            type: 'text',
            value: value.slice(lastIndex),
          });
        }

        // Replace the original node with our new nodes
        if (newNodes.length > 0) {
          parent.children.splice(index, 1, ...newNodes);
          // Return the index offset to continue visiting correctly
          return index + newNodes.length;
        }
      }
    });
  };
