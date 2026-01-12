/// <reference types="chrome" />

import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { Readability } from '@mozilla/readability';
import { PremiumReader } from '@premium-reader/reader-ui';
import type { ExtractedArticle, UserSettings } from '@premium-reader/types';

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes insight-glow {
    0% { background-color: #FEF3C7; box-shadow: 0 0 0 2px #FEF3C7; }
    100% { background-color: transparent; box-shadow: none; }
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.7; }
  }
  .key-insight { font-weight: 600; }
  .paragraph-highlight .key-insight { animation: insight-glow 400ms ease-out; }
  .premium-reader { animation: slideIn 300ms ease-out; }
  .skeleton-pulse { animation: pulse 1.5s infinite; }
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateX(-50%) translateY(10px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
  @keyframes fadeOutDown {
    from { opacity: 1; transform: translateX(-50%) translateY(0); }
    to { opacity: 0; transform: translateX(-50%) translateY(10px); }
  }
`;
document.head.appendChild(styleSheet);

let readerActive = false;
let readerContainer: HTMLDivElement | null = null;
let reactRoot: Root | null = null;
let originalOverflow: string = '';

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TOGGLE_READER' || message.type === 'ACTIVATE_READER') {
    if (readerActive) {
      closeReader();
    } else {
      activateReader();
    }
    sendResponse({ success: true });
  }
});

async function getApiUrl(): Promise<string> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'GET_API_URL' }, (response) => {
      resolve(response?.url || 'http://localhost:3001');
    });
  });
}

async function getAuthToken(): Promise<string | null> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'GET_AUTH_TOKEN' }, (response) => {
      resolve(response?.token || null);
    });
  });
}

async function getUserSettings(): Promise<Partial<UserSettings>> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'GET_USER_SETTINGS' }, (response) => {
      resolve(response?.settings || {});
    });
  });
}

function extractArticle(): ExtractedArticle | null {
  try {
    // Clone document to avoid modifying original
    const documentClone = document.cloneNode(true) as Document;

    const reader = new Readability(documentClone, {
      charThreshold: 100,
    });

    const article = reader.parse();

    if (!article || !article.content) {
      console.log('Readability could not parse article');
      return null;
    }

    return {
      title: article.title || document.title,
      content: article.content,
      author: article.byline || undefined,
      siteName: article.siteName || new URL(window.location.href).hostname,
      excerpt: article.excerpt || undefined,
    };
  } catch (error) {
    console.error('Failed to extract article:', error);
    return null;
  }
}

async function enhanceArticle(paragraphs: string[]) {
  const apiUrl = await getApiUrl();

  try {
    const response = await fetch(`${apiUrl}/api/enhance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paragraphs }),
    });

    if (!response.ok) {
      throw new Error(`Enhancement failed: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      console.error('No reader available for SSE');
      return;
    }

    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));

            if (data.done) {
              console.log('Enhancement complete');
              continue;
            }

            if (data.error) {
              console.error('Enhancement error:', data.error);
              continue;
            }

            // Dispatch event to React app
            window.dispatchEvent(
              new CustomEvent('premium-reader-enhance', {
                detail: data,
              })
            );
          } catch (e) {
            console.error('Failed to parse SSE data:', e);
          }
        }
      }
    }
  } catch (error) {
    console.error('Enhancement failed:', error);
    showToast('AI enhancement unavailable');
  }
}

async function saveArticle(article: ExtractedArticle) {
  const apiUrl = await getApiUrl();
  const token = await getAuthToken();

  if (!token) {
    // Open login page
    window.open(`${apiUrl.replace('/api', '')}/login?extension=true`, '_blank');
    showToast('Please log in to save articles');
    return;
  }

  try {
    const response = await fetch(`${apiUrl}/api/articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        url: window.location.href,
        title: article.title,
        author: article.author,
        siteName: article.siteName,
        content: article.content,
      }),
    });

    if (!response.ok) {
      throw new Error(`Save failed: ${response.status}`);
    }

    showToast('Article saved!');
  } catch (error) {
    console.error('Failed to save:', error);
    showToast('Failed to save article');
  }
}

async function activateReader() {
  // Extract article content
  const article = extractArticle();

  if (!article) {
    showToast('Could not extract article from this page');
    return;
  }

  // Get user settings
  const settings = await getUserSettings();

  // Create reader container
  readerContainer = document.createElement('div');
  readerContainer.id = 'premium-reader-root';

  // Save original body overflow
  originalOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  document.body.appendChild(readerContainer);
  readerActive = true;

  // Mount React app
  reactRoot = createRoot(readerContainer);

  reactRoot.render(
    <PremiumReader
      article={article}
      onClose={closeReader}
      onSave={() => saveArticle(article)}
      onEnhance={(paragraphs) => enhanceArticle(paragraphs)}
      initialTheme={(settings.theme as UserSettings['theme']) || 'light'}
      initialFontSize={(settings.fontSize as UserSettings['fontSize']) || 'medium'}
    />
  );
}

function closeReader() {
  if (reactRoot) {
    reactRoot.unmount();
    reactRoot = null;
  }

  if (readerContainer) {
    readerContainer.remove();
    readerContainer = null;
  }

  document.body.style.overflow = originalOverflow;
  readerActive = false;
}

function showToast(message: string) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: #1A1A1A;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 14px;
    z-index: 9999999;
    animation: fadeInUp 200ms ease-out;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'fadeOutDown 200ms ease-out forwards';
    setTimeout(() => toast.remove(), 200);
  }, 2500);
}

// Handle Escape key globally
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && readerActive) {
    closeReader();
  }
});

console.log('Premium Reader content script loaded');
