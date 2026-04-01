const getApiKey = () => (import.meta.env.VITE_API_KEY as string) || 'changeme'
const getBaseUrl = () => (import.meta.env.VITE_API_BASE_URL as string) || ''

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return { 'X-API-Key': getApiKey(), ...extra }
}

export function authKeyParam(): string {
  return `key=${encodeURIComponent(getApiKey())}`
}

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

export interface ImageSpec {
  url: string
  marker: string
  title?: string
}

export interface ConvertOptions {
  format?: string
  crf?: number
  video_bitrate?: string | null
  audio_bitrate?: string
  resolution?: string | null
  normalize_audio?: boolean
}

export interface ConvertRequest {
  title: string
  description?: string
  audio_url: string
  images?: ImageSpec[]
  image_url?: string
  options?: ConvertOptions
}

export interface JobResponse {
  job_id: string
  progress_url: string
  status_url: string
  download_url: string
}

export interface UploadResponse {
  file_url: string
  preview_url: string
  filename: string
}

export interface JobStatus {
  job_id: string
  status: 'pending' | 'processing' | 'complete' | 'error'
  percent: number
  time_processed: string | null
  error: string | null
  download_url: string | null
}

// --------------------------------------------------------------------------
// API calls
// --------------------------------------------------------------------------

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(text || `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

export async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`${getBaseUrl()}/files/upload`, {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
  })
  return handleResponse<UploadResponse>(res)
}

export async function startConversion(req: ConvertRequest): Promise<JobResponse> {
  const res = await fetch(`${getBaseUrl()}/convert`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(req),
  })
  return handleResponse<JobResponse>(res)
}

export async function getJobStatus(jobId: string): Promise<JobStatus> {
  const res = await fetch(`${getBaseUrl()}/jobs/${jobId}/status`, {
    headers: authHeaders(),
  })
  return handleResponse<JobStatus>(res)
}

/** Returns an EventSource URL that passes the key as a query param (EventSource can't set headers). */
export function progressStreamUrl(jobId: string): string {
  return `${getBaseUrl()}/jobs/${jobId}/progress?${authKeyParam()}`
}

/** Fetch the video as a Blob and return an Object URL for use in <video src>. */
export async function fetchVideoObjectUrl(jobId: string): Promise<string> {
  const res = await fetch(`${getBaseUrl()}/jobs/${jobId}/download`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Download failed: HTTP ${res.status}`)
  const blob = await res.blob()
  return URL.createObjectURL(blob)
}

/** Direct download URL (passes key as query param for <a href> usage). */
export function directDownloadUrl(jobId: string): string {
  return `${getBaseUrl()}/jobs/${jobId}/download?${authKeyParam()}`
}
