import { useRef, useState } from 'react'
import { Image, Clock, Tag, Trash2, Upload, Link, SkipForward } from 'lucide-react'
import { Input } from './ui/Input'
import { Button } from './ui/Button'
import { cn, isValidMarker, secondsToMarker } from '@/lib/utils'
import { uploadFile } from '@/lib/api'

export interface ImageMarker {
  id: string
  previewUrl: string
  convertUrl: string
  marker: string
  title: string
  uploading?: boolean
  error?: string
}

interface ImageMarkerCardProps {
  image: ImageMarker
  index: number
  audioDuration: number
  onUpdate: (updated: Partial<ImageMarker>) => void
  onRemove: () => void
  onSeek?: (seconds: number) => void
  hasError?: boolean
  id?: string
}

export function ImageMarkerCard({
  image,
  index,
  onUpdate,
  onRemove,
  onSeek,
  hasError,
  id,
}: ImageMarkerCardProps) {
  const [mode, setMode] = useState<'url' | 'file'>(
    image.convertUrl.startsWith('file://') ? 'file' : 'url',
  )
  const fileInputRef = useRef<HTMLInputElement>(null)
  const markerInvalid = image.marker !== '' && !isValidMarker(image.marker)

  const handleFile = async (file: File) => {
    onUpdate({ uploading: true, error: undefined })
    try {
      const { file_url, preview_url } = await uploadFile(file)
      onUpdate({
        convertUrl: file_url,
        previewUrl: preview_url,
        uploading: false,
      })
    } catch (e) {
      onUpdate({ uploading: false, error: String(e) })
    }
  }

  return (
    <div id={id} className={cn(
      'bg-white border rounded-xl p-4 flex gap-4 shadow-sm hover:shadow-md transition-shadow',
      hasError ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200',
    )}>
      {/* Thumbnail */}
      <div
        className="flex-shrink-0 w-20 h-20 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 border border-blue-100 overflow-hidden flex items-center justify-center cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        {image.previewUrl ? (
          <img src={image.previewUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <Image className="h-7 w-7 text-blue-300" />
        )}
      </div>

      {/* Form */}
      <div className="flex-1 flex flex-col gap-2.5">
        <div className="flex items-center gap-3 justify-between">
          {/* Chapter ordinal */}
          <span className="text-xs font-semibold text-blue-500 bg-blue-50 rounded-full px-2.5 py-0.5">
            Chapter {index + 1}
          </span>

          {/* URL / File toggle */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
            <button
              className={cn(
                'px-2.5 py-1 transition-colors',
                mode === 'url' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50',
              )}
              onClick={() => setMode('url')}
            >
              <Link className="h-3 w-3 inline mr-1" />URL
            </button>
            <button
              className={cn(
                'px-2.5 py-1 transition-colors',
                mode === 'file' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50',
              )}
              onClick={() => { setMode('file'); fileInputRef.current?.click() }}
            >
              <Upload className="h-3 w-3 inline mr-1" />Upload
            </button>
          </div>

          <Button variant="ghost" size="sm" className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={onRemove}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {mode === 'url' ? (
          <Input
            placeholder="https://example.com/image.jpg"
            value={image.previewUrl.startsWith('/cache/') ? image.convertUrl : image.previewUrl}
            onChange={(e) => onUpdate({ previewUrl: e.target.value, convertUrl: e.target.value })}
            onBlur={(e) => { const v = e.target.value.trim(); onUpdate({ previewUrl: v, convertUrl: v }) }}
            onPaste={(e) => { e.preventDefault(); const v = e.clipboardData.getData('text').trim(); onUpdate({ previewUrl: v, convertUrl: v }) }}
            className="text-xs h-8"
          />
        ) : (
          <div
            className={cn(
              'flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 border border-dashed border-gray-300 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors',
              image.uploading && 'opacity-60',
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-3.5 w-3.5 flex-shrink-0" />
            {image.uploading
              ? 'Uploading…'
              : image.convertUrl.startsWith('file://')
                ? '✓ Uploaded'
                : 'Click to choose image file'}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        <div className="flex gap-2">
          {/* Time marker */}
          <div className="flex items-center gap-1.5 flex-1">
            <Clock className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="HH:MM:SS"
              value={image.marker}
              onChange={(e) => onUpdate({ marker: e.target.value })}
              onBlur={(e) => onUpdate({ marker: e.target.value.trim() })}
              onPaste={(e) => { e.preventDefault(); onUpdate({ marker: e.clipboardData.getData('text').trim() }) }}
              className={cn(
                'flex-1 text-xs rounded-lg border px-2.5 py-1.5 font-mono focus:outline-none focus:ring-2',
                markerInvalid
                  ? 'border-red-300 focus:ring-red-200'
                  : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100',
              )}
            />
            {onSeek && (
              <button
                title="Jump waveform to this time marker"
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors rounded"
                onClick={() => {
                  const parts = image.marker.split(':').map(Number)
                  const secs = parts.length === 3
                    ? parts[0] * 3600 + parts[1] * 60 + parts[2]
                    : parts[0] * 60 + (parts[1] || 0)
                  onSeek(secs)
                }}
              >
                <SkipForward className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Title */}
          <div className="flex items-center gap-1.5 flex-1">
            <Tag className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Chapter title (optional)"
              value={image.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              onBlur={(e) => onUpdate({ title: e.target.value.trim() })}
              onPaste={(e) => { e.preventDefault(); onUpdate({ title: e.clipboardData.getData('text').trim() }) }}
              className="flex-1 text-xs rounded-lg border border-gray-200 px-2.5 py-1.5 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
        {image.error && <p className="text-xs text-red-500">{image.error}</p>}
      </div>
    </div>
  )
}

function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Helper to create a blank ImageMarker
export function makeImageMarker(marker = '00:00:00'): ImageMarker {
  return {
    id: generateId(),
    previewUrl: '',
    convertUrl: '',
    marker,
    title: '',
  }
}
