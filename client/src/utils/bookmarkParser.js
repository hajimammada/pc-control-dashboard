// Utility to parse Chrome / Firefox / Safari exported Netscape Bookmark HTML files
// Splits into barBookmarks (Bookmarks Bar) and otherBookmarks (Other Bookmarks / All Other Folders)

export function parseNetscapeBookmarksHtml(htmlString) {
  if (!htmlString || typeof htmlString !== 'string') {
    return { barBookmarks: [], otherBookmarks: [] };
  }

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
          const isPersonalToolbar = h3.getAttribute('PERSONAL_TOOLBAR_FOLDER') === 'true' || 
                                    h3.getAttribute('personal_toolbar_folder') === 'true' ||
                                    folderTitle.toLowerCase().includes('bookmarks bar') ||
                                    folderTitle.toLowerCase().includes('toolbar');
          const children = nextEl ? parseContainer(nextEl) : [];
          results.push({
            id: 'folder_' + Math.random().toString(36).substr(2, 9),
            title: folderTitle,
            isFolder: true,
            isPersonalToolbar: isPersonalToolbar,
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

  try {
    const rootDl = doc.querySelector('dl, DL');
    if (rootDl) {
      const allItems = parseContainer(rootDl);

      // Find the Bookmarks Bar folder
      const barFolder = allItems.find(item => item.isFolder && item.isPersonalToolbar);

      let barBookmarks = [];
      let otherBookmarks = [];

      if (barFolder) {
        barBookmarks = barFolder.children || [];
        otherBookmarks = allItems.filter(item => item !== barFolder);
      } else {
        // Look for item named "Bookmarks bar" or similar
        const namedBar = allItems.find(item => item.isFolder && item.title.toLowerCase().includes('bar'));
        if (namedBar) {
          barBookmarks = namedBar.children || [];
          otherBookmarks = allItems.filter(item => item !== namedBar);
        } else {
          barBookmarks = allItems;
          otherBookmarks = [];
        }
      }

      return {
        barBookmarks,
        otherBookmarks
      };
    }
  } catch (e) {
    console.warn('DOMParser failed:', e);
  }

  return {
    barBookmarks: [],
    otherBookmarks: []
  };
}