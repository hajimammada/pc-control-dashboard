// Utility to parse Chrome / Firefox / Safari exported Netscape Bookmark HTML files

export function parseNetscapeBookmarksHtml(htmlString) {
  if (!htmlString || typeof htmlString !== 'string') return [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');

  function parseContainer(container) {
    const results = [];
    const elements = container.children;

    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];

      if (el.tagName === 'DT') {
        const h3 = el.querySelector(':scope > H3, :scope > h3');
        const a = el.querySelector(':scope > A, :scope > a');
        const nextEl = el.querySelector(':scope > DL, :scope > dl') || 
                       (el.nextElementSibling && el.nextElementSibling.tagName === 'DL' ? el.nextElementSibling : null) ||
                       (el.nextElementSibling && el.nextElementSibling.querySelector(':scope > DL, :scope > dl'));

        if (h3) {
          const folderTitle = h3.textContent.trim();
          const children = nextEl ? parseContainer(nextEl) : [];
          results.push({
            id: 'folder_' + Math.random().toString(36).substr(2, 9),
            title: folderTitle,
            isFolder: true,
            children: children
          });
        } else if (a) {
          const title = a.textContent.trim();
          const url = a.getAttribute('href');
          const iconUrl = a.getAttribute('icon') || a.getAttribute('ICON') || null;

          if (url) {
            results.push({
              id: 'bm_' + Math.random().toString(36).substr(2, 9),
              title: title || url,
              url: url,
              iconUrl: iconUrl
            });
          }
        }
      } else if (el.tagName === 'DL') {
        const subItems = parseContainer(el);
        results.push(...subItems);
      }
    }

    return results;
  }

  // Fallback: If DOMParser didn't give clean tree, also do robust token parser
  try {
    const rootDl = doc.querySelector('dl, DL');
    if (rootDl) {
      const allItems = parseContainer(rootDl);
      
      // Look for "Bookmarks bar" or "Bookmarks toolbar"
      const bookmarksBar = allItems.find(item => 
        item.isFolder && (
          item.title.toLowerCase().includes('bookmarks bar') || 
          item.title.toLowerCase().includes('toolbar')
        )
      );

      if (bookmarksBar && bookmarksBar.children && bookmarksBar.children.length > 0) {
        return bookmarksBar.children;
      }

      if (allItems.length > 0) {
        return allItems;
      }
    }
  } catch (e) {
    console.warn('DOMParser failed, falling back to regex parser', e);
  }

  // Regex fallback parser
  return regexBookmarkParser(htmlString);
}

function regexBookmarkParser(html) {
  const items = [];
  const linkRegex = /<A\s+HREF="([^"]+)"(?:\s+ADD_DATE="[^"]*")?(?:\s+ICON="([^"]*)")?[^>]*>([^<]+)<\/A>/gi;
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    items.push({
      id: 'bm_' + Math.random().toString(36).substr(2, 9),
      url: match[1],
      iconUrl: match[2] || null,
      title: match[3]
    });
  }

  return items;
}