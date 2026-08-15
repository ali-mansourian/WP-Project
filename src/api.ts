// Helper to retrieve the current user's token from local storage
export const getAuthToken = (): string | null => {
  const userStr = localStorage.getItem('spotify_mock_current_user');
  if (!userStr) return null;
  try {
    const user = JSON.parse(userStr);
    return user.token || null;
  } catch (e) {
    return null;
  }
};

/**
 * A wrapper around the native fetch API.
 * Automatically adds the Authorization token and Content-Type headers.
 * Resolves with parsed JSON, or throws an Error if the response is not OK.
 */
export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };

  // Do not set Content-Type if we are uploading files via FormData
  // The browser will automatically set 'multipart/form-data' with the correct boundary
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Attach Django Token authentication
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }

  // Merge any custom headers passed in options
  const finalHeaders = { ...headers, ...(options.headers as Record<string, string>) };

  const response = await fetch(endpoint, {
    ...options,
    headers: finalHeaders,
  });

  // 204 No Content means success but no JSON to parse (e.g., DELETE requests)
  if (response.status === 204) {
    return null;
  }

  // Safely parse JSON response
  const data = await response.json().catch(() => null);

  // If the status code is an error (400, 401, 403, 500, etc.), throw it
  if (!response.ok) {
    // Attempt to extract Django REST Framework error messages
    const errorMessage = 
      data?.detail || 
      data?.non_field_errors?.[0] || 
      data?.error || 
      (typeof data === 'object' && data !== null ? Object.values(data)[0] : 'An unexpected error occurred.');
    
    throw new Error(String(errorMessage));
  }

  return data;
};