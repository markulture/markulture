/**
 * Fix Copy Path button in Decap CMS Media Library
 * Changes path from public/images/uploads/... to /images/uploads/...
 */
(function() {
  'use strict';

  // Configuration - match your config.yml settings
  const MEDIA_FOLDER_PREFIX = 'public/images/uploads';
  const PUBLIC_FOLDER_PREFIX = '/images/uploads';

  // Method 1: Override clipboard API
  const originalWriteText = navigator.clipboard.writeText.bind(navigator.clipboard);
  navigator.clipboard.writeText = function(text) {
    if (text && typeof text === 'string' && text.includes(MEDIA_FOLDER_PREFIX)) {
      const fixedPath = text.replace(MEDIA_FOLDER_PREFIX, PUBLIC_FOLDER_PREFIX);
      console.log('[Media Path Fix] Converted:', text, '->', fixedPath);
      return originalWriteText(fixedPath);
    }
    return originalWriteText(text);
  };

  // Method 2: Override execCommand for fallback clipboard operations
  const originalExecCommand = document.execCommand.bind(document);
  document.execCommand = function(command, showUI, value) {
    if (command === 'copy') {
      const selection = window.getSelection();
      if (selection && selection.toString().includes(MEDIA_FOLDER_PREFIX)) {
        const fixedText = selection.toString().replace(MEDIA_FOLDER_PREFIX, PUBLIC_FOLDER_PREFIX);
        // Create temporary element with fixed text
        const temp = document.createElement('textarea');
        temp.value = fixedText;
        document.body.appendChild(temp);
        temp.select();
        const result = originalExecCommand('copy');
        document.body.removeChild(temp);
        console.log('[Media Path Fix] execCommand converted path');
        return result;
      }
    }
    return originalExecCommand(command, showUI, value);
  };

  // Method 3: Intercept clicks on Copy Path button and modify behavior
  document.addEventListener('click', function(e) {
    const button = e.target.closest('button');
    if (!button) return;
    
    const buttonText = button.textContent || button.innerText || '';
    // Check for Copy Path button (various languages)
    if (buttonText.includes('Copy Path') || buttonText.includes('Sao chép đường dẫn') || buttonText.includes('Copy path')) {
      // Wait a tiny bit for the copy to happen, then check/fix
      setTimeout(function() {
        navigator.clipboard.readText().then(function(text) {
          if (text && text.includes(MEDIA_FOLDER_PREFIX)) {
            const fixedPath = text.replace(MEDIA_FOLDER_PREFIX, PUBLIC_FOLDER_PREFIX);
            navigator.clipboard.writeText(fixedPath).then(function() {
              console.log('[Media Path Fix] Post-click fix:', text, '->', fixedPath);
            });
          }
        }).catch(function() {
          // Clipboard read permission denied, rely on other methods
        });
      }, 100);
    }
  }, true);

  console.log('[Media Path Fix] Loaded - all copy methods intercepted');
})();
