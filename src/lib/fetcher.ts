import { decryptData } from "@/lib/crypto";

export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = "ApiError";
  }
}

// Base API URL - using external API directly
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.sansekai.my.id/api";

export async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  // Convert /api/ URLs to external API URLs
  let fetchUrl = url;
  if (url.startsWith("/api/")) {
    // Remove /api/ prefix and construct external URL
    const path = url.replace("/api/", "");
    fetchUrl = `${API_BASE_URL}/${path}`;
  }

  try {
    const response = await fetch(fetchUrl, {
      ...options,
      cache: 'no-store', // Disable caching for dynamic content
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }
      
      // Throw error with status to be caught by React Query
      throw new ApiError(
        errorData?.error || errorData?.message || `Request failed with status ${response.status}`, 
        response.status, 
        errorData
      );
    }

    const json = await response.json();
    
    // Handle encrypted responses from SANSEKAI API
    if (json.data && typeof json.data === "string") {
      try {
        const decrypted = decryptData(json.data);
        return decrypted as T;
      } catch (error) {
        console.error("Failed to decrypt data:", error);
        // Return original if decryption fails
        return json as T;
      }
    }
    
    return json as T;
  } catch (error) {
    // Re-throw ApiError as is
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle network errors
    console.error("Fetch error:", error);
    throw new ApiError(
      error instanceof Error ? error.message : "Network error occurred",
      0,
      { originalError: error }
    );
  }
}
