import { useEffect } from 'react';
import { getCrmToken } from '../api/api.js'

const SCRIPT_URL = process.env.REACT_APP_HUBSPOT_CHAT_SCRIPT_URL;
const SCRIPT_ELEMENT_ID = 'hs-script-loader-private';

const loadWidgetWhenReady = () => {
  if (window.HubSpotConversations) {
    window.HubSpotConversations.widget.load();
  } else {
    window.hsConversationsOnReady = [() => window.HubSpotConversations.widget.load()];
  }
}

export default ({ email }) => {
  // HubSpot chat will be disabled if REACT_APP_HUBSPOT_CHAT_SCRIPT_URL is unset
  if (!SCRIPT_URL) return null;

  useEffect(() => {
    window.hsConversationsSettings = { loadImmediately: false };
    if (email) {
      getCrmToken().then(token => {
        if (token) {
          if (token.error) {
            throw new Error(`CRM token API returned error: ${token.error.msg}. Server may be misconfigured`);
          }
          window.hsConversationsSettings['identificationToken'] = token?.data?.token;
          window.hsConversationsSettings['identificationEmail'] = email;
        }
      })
      .catch(console.warn)
      .finally(loadWidgetWhenReady);
    } else {
      loadWidgetWhenReady();
    }
    let script = document.getElementById(SCRIPT_ELEMENT_ID);
    if (!script) {
      script = document.createElement('script');
      script.id = SCRIPT_ELEMENT_ID;
      script.src = SCRIPT_URL;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
    return () => {
      if (email && window.HubSpotConversations && window.HubSpotConversations.resetAndReloadWidget) {
        window.HubSpotConversations.resetAndReloadWidget();
      }
    };
  }, [email]);

  useEffect(() => () => {
    if (window.HubSpotConversations) {
      window.HubSpotConversations.widget.remove();
    }
    delete window.HubSpotConversations;
    const script = document.getElementById(SCRIPT_ELEMENT_ID);
    if (script) {
      document.body.removeChild(script);
    }
  }, []);

  return null;
};
