/**
 * Auto-sort blog collection by newest first
 * Decap CMS doesn't support default sort direction in config,
 * so we use JavaScript to simulate clicking the sort control
 */
(function() {
  'use strict';

  // Track if we've already applied the sort
  let sortApplied = false;
  let lastUrl = '';

  function findAndClickDateSort() {
    // Find the sort dropdown - Decap CMS uses a specific structure
    const sortDropdown = document.querySelector('[class*="SortControl"]');
    if (!sortDropdown) return false;

    // Find the select element inside
    const select = sortDropdown.querySelector('select');
    if (select) {
      // Find the date option
      const dateOption = Array.from(select.options).find(opt => 
        opt.value === 'date' || 
        opt.textContent.toLowerCase().includes('date') ||
        opt.textContent.toLowerCase().includes('ngày')
      );
      
      if (dateOption && select.value !== dateOption.value) {
        select.value = dateOption.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('[Blog Sort] Selected date sort');
      }
      
      // Now click the direction toggle button to reverse (make it descending)
      setTimeout(() => {
        const sortButton = sortDropdown.querySelector('button');
        if (sortButton) {
          // Check if currently ascending (we want descending)
          const svg = sortButton.querySelector('svg');
          // Click to toggle direction - may need to click twice
          sortButton.click();
          console.log('[Blog Sort] Toggled sort direction');
        }
      }, 200);
      
      return true;
    }
    return false;
  }

  function reorderEntriesByDate() {
    // Find entries container
    const containers = document.querySelectorAll('[class*="CardsGrid"], [class*="Entries"]');
    
    for (const container of containers) {
      const entries = Array.from(container.children);
      if (entries.length < 2) continue;

      // Extract dates and sort
      const entriesWithDates = entries.map(entry => {
        const text = entry.textContent || '';
        const dateMatch = text.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        let timestamp = 0;
        if (dateMatch) {
          const [, day, month, year] = dateMatch;
          timestamp = new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).getTime();
        }
        return { entry, timestamp };
      });

      // Sort by date descending (newest first)
      entriesWithDates.sort((a, b) => b.timestamp - a.timestamp);

      // Check if already in correct order
      const isAlreadySorted = entriesWithDates.every((item, index) => {
        return item.entry === entries[index] || item.timestamp === 0;
      });

      if (!isAlreadySorted) {
        // Re-append in sorted order
        entriesWithDates.forEach(({ entry }) => {
          container.appendChild(entry);
        });
        console.log('[Blog Sort] Reordered entries by date (newest first)');
        return true;
      }
    }
    return false;
  }

  function applySortOnBlogPage() {
    const url = window.location.href;
    
    // Only run on blog collection page
    if (!url.includes('/collections/blog')) {
      sortApplied = false;
      return;
    }

    // Avoid re-running on same URL
    if (url === lastUrl && sortApplied) {
      return;
    }

    lastUrl = url;

    // Try the dropdown method first
    if (findAndClickDateSort()) {
      sortApplied = true;
      return;
    }

    // Fallback: direct DOM reordering
    if (reorderEntriesByDate()) {
      sortApplied = true;
    }
  }

  // Monitor for navigation and content changes
  function init() {
    // Use MutationObserver to detect when content loads
    const observer = new MutationObserver(() => {
      clearTimeout(window._sortDebounce);
      window._sortDebounce = setTimeout(applySortOnBlogPage, 300);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Also check periodically for URL changes
    setInterval(() => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        sortApplied = false;
        setTimeout(applySortOnBlogPage, 500);
      }
    }, 500);

    // Initial runs with delays
    setTimeout(applySortOnBlogPage, 1000);
    setTimeout(applySortOnBlogPage, 2000);
    setTimeout(applySortOnBlogPage, 3500);
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
