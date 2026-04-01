import { useState } from 'react'
import { ChevronDown, ChevronUp, Settings } from 'lucide-react'
import type { ConvertOptions } from '@/lib/api'
import { Select } from './ui/Select'
import { Input } from './ui/Input'
import { Switch } from './ui/Switch'

interface OptionsPanelProps {
  options: ConvertOptions
  onChange: (opt: Partial<ConvertOptions>) => void
}

export function OptionsPanel({ options, onChange }: OptionsPanelProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Settings className="h-4 w-4 text-blue-500" />
          Video Options
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>

      {open && (
        <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
          <Select
            label="Format"
            value={options.format ?? 'mp4'}
            onChange={(e) => onChange({ format: e.target.value })}
            options={[
              { value: 'mp4', label: 'MP4 (recommended)' },
              { value: 'mkv', label: 'MKV' },
              { value: 'webm', label: 'WebM' },
            ]}
          />

          <Select
            label="Resolution"
            value={options.resolution ?? '1920x1080'}
            onChange={(e) => onChange({ resolution: e.target.value || null })}
            options={[
              { value: '1920x1080', label: '1080p (1920×1080)' },
              { value: '1280x720', label: '720p (1280×720)' },
              { value: '854x480', label: '480p (854×480)' },
              { value: '3840x2160', label: '4K (3840×2160)' },
            ]}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Quality (CRF)
              <span className="ml-1 text-xs text-gray-400 font-normal">
                lower = better, {options.crf ?? 23}
              </span>
            </label>
            <input
              type="range"
              min={0}
              max={51}
              value={options.crf ?? 23}
              onChange={(e) => onChange({ crf: Number(e.target.value) })}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>Best (0)</span>
              <span>Worst (51)</span>
            </div>
          </div>

          <Input
            label="Audio Bitrate"
            value={options.audio_bitrate ?? '192k'}
            onChange={(e) => onChange({ audio_bitrate: e.target.value })}
            placeholder="192k"
          />

          <Input
            label="Video Bitrate (optional)"
            value={options.video_bitrate ?? ''}
            onChange={(e) => onChange({ video_bitrate: e.target.value || null })}
            placeholder="e.g. 2M (overrides CRF)"
          />

          <div className="flex items-center sm:col-span-2 pt-1">
            <Switch
              checked={options.normalize_audio ?? false}
              onChange={(v) => onChange({ normalize_audio: v })}
              label="Normalize Audio"
              description="Apply loudnorm filter to even out audio levels"
            />
          </div>
        </div>
      )}
    </div>
  )
}
