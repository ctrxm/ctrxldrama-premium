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

export async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    cache: 'no-store',
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText };
    }
    
    throw new ApiError(
      errorData?.error || errorData?.message || "An error occurred", 
      response.status, 
      errorData
    );
  }

  const json = await response.json();
  
  if (json.data && typeof json.data === "string") {
    return decryptData(json.data) as T;
  }
  
  return json as T;
}
