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

// Base API URL - using external API directly for static export
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.sansekai.my.id/api";

export async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  // Convert /api/ URLs to external API URLs
  let fetchUrl = url;
  if (url.startsWith("/api/")) {
    // Remove /api/ prefix and construct external URL
    const path = url.replace("/api/", "");
    fetchUrl = `${API_BASE_URL}/${path}`;
  }

  const response = await fetch(fetchUrl, {
    ...options,
    cache: 'no-store', // Disable caching for dynamic content
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
        errorData?.error || errorData?.message || "An error occurred", 
        response.status, 
        errorData
    );
  }

  const json = await response.json();
  
  // Handle encrypted responses from SANSEKAI API
  if (json.data && typeof json.data === "string") {
    try {
      return decryptData(json.data);
    } catch (error) {
      console.error("Failed to decrypt data:", error);
      return json;
    }
  }
  
  return json;
}
