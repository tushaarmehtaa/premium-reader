/// <reference types="chrome" />

const API_URL = process.env.API_URL || 'http://localhost:3001';

// Handle extension icon click
chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;

  // Check if we can inject into this tab
  if (tab.url?.startsWith('chrome://') || tab.url?.startsWith('chrome-extension://')) {
    console.log('Cannot inject into chrome:// or extension pages');
    return;
  }

  try {
    // Send message to content script to toggle reader
    await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_READER' });
  } catch (error) {
    // Content script not yet loaded, inject it first
    console.log('Injecting content script...');
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js'],
      });
      // Wait a bit for script to initialize, then send message
      setTimeout(async () => {
        try {
          await chrome.tabs.sendMessage(tab.id!, { type: 'TOGGLE_READER' });
        } catch (e) {
          console.error('Failed to send message after injection:', e);
        }
      }, 100);
    } catch (e) {
      console.error('Failed to inject content script:', e);
    }
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'GET_API_URL':
      sendResponse({ url: API_URL });
      break;

    case 'GET_AUTH_TOKEN':
      chrome.storage.local.get(['authToken'], (result) => {
        sendResponse({ token: result.authToken || null });
      });
      return true; // Keep channel open for async response

    case 'SET_AUTH_TOKEN':
      chrome.storage.local.set({ authToken: message.token }, () => {
        sendResponse({ success: true });
      });
      return true;

    case 'CLEAR_AUTH_TOKEN':
      chrome.storage.local.remove(['authToken'], () => {
        sendResponse({ success: true });
      });
      return true;

    case 'GET_USER_SETTINGS':
      chrome.storage.sync.get(['userSettings'], (result) => {
        sendResponse({
          settings: result.userSettings || {
            theme: 'light',
            fontSize: 'medium',
            defaultMode: 'read',
          },
        });
      });
      return true;

    case 'SET_USER_SETTINGS':
      chrome.storage.sync.set({ userSettings: message.settings }, () => {
        sendResponse({ success: true });
      });
      return true;

    default:
      console.log('Unknown message type:', message.type);
  }
});

// Listen for installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Premium Reader installed!');
    // Set default settings
    chrome.storage.sync.set({
      userSettings: {
        theme: 'light',
        fontSize: 'medium',
        defaultMode: 'read',
      },
    });
  } else if (details.reason === 'update') {
    console.log('Premium Reader updated to version', chrome.runtime.getManifest().version);
  }
});

export {};
