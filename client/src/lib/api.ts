const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

class ApiClient {
  private getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    
    // Use Record<string, string> to safely access and modify headers
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    // Default to application/json if not FormData
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // If body is FormData, let the browser set Content-Type
    if (options.body instanceof FormData) {
        delete headers['Content-Type'];
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || 'API Error');
    }

    return response.json();
  }

  get<T>(endpoint: string) {
    return this.fetch<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, body: unknown) {
    const isFormData = body instanceof FormData;
    return this.fetch<T>(endpoint, {
      method: 'POST',
      body: isFormData ? (body as BodyInit) : JSON.stringify(body),
    });
  }

  put<T>(endpoint: string, body: unknown) {
    const isFormData = body instanceof FormData;
    return this.fetch<T>(endpoint, {
      method: 'PUT',
      body: isFormData ? (body as BodyInit) : JSON.stringify(body),
    });
  }

  patch<T>(endpoint: string, body: unknown) {
    return this.fetch<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  delete<T>(endpoint: string) {
    return this.fetch<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
