import type { ApiResponse } from './types';

// The deployed web app URL of your Google Apps Script
// This should be injected via environment variables in production
const API_BASE_URL = import.meta.env.VITE_APP_GAS_URL || 'YOUR_DEPLOYED_GAS_WEB_APP_URL';
const API_KEY = import.meta.env.VITE_APP_API_KEY || 'your-secure-api-key-here';

async function fetchWrapper<T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const headers = {
    'Content-Type': 'text/plain;charset=utf-8', // GAS often requires plain text to avoid preflight CORS issues in some setups
    ...(options.headers || {})
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const json = await response.json() as ApiResponse<T>;
    return json;
  } catch (error: any) {
    console.error("API Call Failed", error);
    return {
      success: false,
      message: error.message || 'Network failure',
      data: null
    };
  }
}

export const api = {
  get: <T>(action: string, params: Record<string, string> = {}) => {
    const url = new URL(API_BASE_URL);
    url.searchParams.append('action', action);
    url.searchParams.append('apiKey', API_KEY);
    
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    
    return fetchWrapper<T>(url.toString(), { method: 'GET' });
  },
  
  post: <T>(action: string, data: any) => {
    // GAS requires a POST to the base URL
    const payload = {
      action,
      apiKey: API_KEY,
      data
    };
    return fetchWrapper<T>(API_BASE_URL, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
};

export const authApi = {
  exchangeGithubCode: (code: string) => api.post<{ login: string, avatar_url: string }>('exchangeGithubCode', { code })
};
