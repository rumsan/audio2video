import type { ConvertOptions } from './api'

export interface AudioState {
  /** URL to use for WaveSurfer (http://, /cache/xxx, or blob:) */
  previewUrl: string
  /** URL to pass to the convert API (http:// or file://) */
  convertUrl: string
  title: string
  description: string
  originalFilename?: string
  durationSeconds?: number
}

const STORAGE_KEY = 'a2v_audio_state'

export function saveAudioState(state: AudioState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function loadAudioState(): AudioState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AudioState) : null
  } catch {
    return null
  }
}

export function clearAudioState(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export const DEFAULT_OPTIONS: ConvertOptions = {
  format: 'mp4',
  crf: 23,
  video_bitrate: null,
  audio_bitrate: '192k',
  resolution: '1920x1080',
  normalize_audio: false,
}
