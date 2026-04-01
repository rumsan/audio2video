import { Link as RouterLink } from '@tanstack/react-router'
import { AppLogo } from './__root'
import { ArrowRight } from 'lucide-react'
import { useSeoMeta } from '@/lib/seo'

function CodeBlock({ code, lang = 'bash' }: { code: string; lang?: string }) {
  return (
    <pre className={`language-${lang} bg-gray-900 text-gray-100 rounded-xl p-5 text-sm overflow-x-auto leading-relaxed`}>
      <code>{code.trim()}</code>
    </pre>
  )
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">{title}</h2>
      <div className="space-y-5">{children}</div>
    </section>
  )
}

function Endpoint({
  method, path, badge, children,
}: {
  method: 'POST' | 'GET'
  path: string
  badge: string
  children: React.ReactNode
}) {
  const colors: Record<string, string> = {
    POST: 'bg-blue-100 text-blue-700',
    GET: 'bg-emerald-100 text-emerald-700',
  }
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50">
        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${colors[method]}`}>{method}</span>
        <code className="text-sm font-mono text-gray-800 font-semibold">{path}</code>
        <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{badge}</span>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  )
}

const tocItems = [
  { href: '#authentication', label: 'Authentication' },
  { href: '#url-schemes', label: 'URL Schemes' },
  { href: '#upload', label: 'POST /files/upload' },
  { href: '#convert', label: 'POST /convert' },
  { href: '#progress', label: 'GET /jobs/{id}/progress' },
  { href: '#status', label: 'GET /jobs/{id}/status' },
  { href: '#download', label: 'GET /jobs/{id}/download' },
  { href: '#full-example', label: 'Full Example' },
]

export function ApiDocsPage() {
  useSeoMeta(
    'API Reference – Audio2Video HTTP API',
    'Full API documentation for the Audio2Video service. Submit conversion jobs, stream real-time progress via SSE, and download MP4/MKV/WebM videos programmatically.',
  )
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <RouterLink to="/">
            <AppLogo />
          </RouterLink>
          <div className="hidden sm:flex items-center gap-6 text-sm text-gray-600 font-medium">
            <RouterLink to="/" className="hover:text-blue-600 transition-colors">Home</RouterLink>
            <RouterLink to="/about" className="hover:text-blue-600 transition-colors">About</RouterLink>
            <RouterLink to="/guide" className="hover:text-blue-600 transition-colors">Docs</RouterLink>
            <RouterLink to="/api-docs" className="text-blue-600 font-semibold">API Docs</RouterLink>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-400 text-sm font-semibold uppercase tracking-widest mb-3">Reference</p>
          <h1 className="text-3xl lg:text-4xl font-extrabold mb-3">API Documentation</h1>
          <p className="text-gray-300 max-w-xl leading-relaxed">
            Audio2Video exposes a RESTful HTTP API. All endpoints require an <code className="text-blue-300 font-mono text-sm">X-API-Key</code> header.
            Interactive Swagger UI is available at{' '}
            <a href="/docs" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline font-mono text-sm">/docs</a>.
          </p>
        </div>
      </div>

      <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-12 flex gap-10">
        {/* Sidebar ToC */}
        <aside className="hidden lg:block w-52 flex-shrink-0">
          <div className="sticky top-24 space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Contents</p>
            {tocItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block text-sm text-gray-500 hover:text-blue-600 py-1 transition-colors"
              >
                {item.label}
              </a>
            ))}
            <div className="pt-4 border-t border-gray-200 mt-4">
              <a
                href="/docs"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline font-medium"
              >
                Swagger UI <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0 space-y-14">

          <Section id="authentication" title="Authentication">
            <p className="text-gray-600">All endpoints require the <code className="font-mono text-sm bg-gray-100 px-1.5 py-0.5 rounded">X-API-Key</code> header matching the value of <code className="font-mono text-sm bg-gray-100 px-1.5 py-0.5 rounded">API_KEY</code> in your <code className="font-mono text-sm bg-gray-100 px-1.5 py-0.5 rounded">.env</code>.</p>
            <CodeBlock lang="http" code={`X-API-Key: your-secret-key`} />
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              <strong>Security note:</strong> Always set a strong, random <code className="font-mono text-xs">API_KEY</code> in production. The default <code className="font-mono text-xs">changeme</code> is insecure.
            </div>
          </Section>

          <Section id="url-schemes" title="URL Schemes">
            <p className="text-gray-600">All URL fields — <code className="font-mono text-sm bg-gray-100 px-1 rounded">audio_url</code>, <code className="font-mono text-sm bg-gray-100 px-1 rounded">image_url</code>, and <code className="font-mono text-sm bg-gray-100 px-1 rounded">images[].url</code> — accept the following schemes:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-gray-700">Scheme</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Example</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="px-4 py-3 font-mono text-blue-700">https:// / http://</td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">https://cdn.example.com/audio.mp3</td>
                    <td className="px-4 py-3 text-gray-500">Downloaded and cached by SHA-256 of URL</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-3 font-mono text-blue-700">file://</td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">file:///home/user/audio.mp3</td>
                    <td className="px-4 py-3 text-gray-500">Read directly from server filesystem — no caching</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-blue-700">server-uploaded</td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">file:///app/cache/abc123.mp3</td>
                    <td className="px-4 py-3 text-gray-500">URL returned by POST /files/upload</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          <Section id="upload" title="POST /files/upload">
            <Endpoint method="POST" path="/files/upload" badge="multipart/form-data">
              <p className="text-gray-600 text-sm">Upload an audio or image file to the server cache. The returned <code className="font-mono text-xs bg-gray-100 px-1 rounded">file_url</code> can be used in any subsequent <code className="font-mono text-xs bg-gray-100 px-1 rounded">/convert</code> request.</p>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Request</p>
                <CodeBlock lang="bash" code={`curl -X POST http://localhost:8000/files/upload \\
  -H "X-API-Key: your-secret-key" \\
  -F "file=@/path/to/audio.mp3"`} />
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Response — 200 OK</p>
                <CodeBlock lang="json" code={`{
  "file_url": "file:///absolute/path/to/cache/abc123def456.mp3",
  "preview_url": "http://localhost:8000/cache/abc123def456.mp3",
  "filename": "audio.mp3"
}`} />
              </div>

              <div className="text-sm text-gray-500 space-y-1">
                <p><code className="font-mono text-xs bg-gray-100 px-1 rounded">file_url</code> — use in <code className="font-mono text-xs bg-gray-100 px-1 rounded">audio_url</code> or <code className="font-mono text-xs bg-gray-100 px-1 rounded">images[].url</code> of a convert request.</p>
                <p><code className="font-mono text-xs bg-gray-100 px-1 rounded">preview_url</code> — browser-accessible HTTP URL for audio waveform preview.</p>
              </div>
            </Endpoint>
          </Section>

          <Section id="convert" title="POST /convert">
            <Endpoint method="POST" path="/convert" badge="application/json">
              <p className="text-gray-600 text-sm">Submit an audio + images conversion job. Returns immediately with a <code className="font-mono text-xs bg-gray-100 px-1 rounded">job_id</code> and polling/streaming URLs.</p>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Request Body</p>
                <CodeBlock lang="json" code={`{
  "title": "My Podcast Episode 1",
  "description": "Episode summary...",
  "audio_url": "https://example.com/ep1.mp3",

  "images": [
    {
      "url": "https://example.com/cover.jpg",
      "marker": "00:00:00",
      "title": "Introduction"
    },
    {
      "url": "https://example.com/slide2.jpg",
      "marker": "00:03:43",
      "title": "Main Topic"
    }
  ],

  "options": {
    "format": "mp4",
    "crf": 23,
    "video_bitrate": null,
    "audio_bitrate": "192k",
    "resolution": "1920x1080",
    "normalize_audio": false
  }
}`} />
              </div>

              <div className="overflow-x-auto">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Fields</p>
                <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Field</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Required</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-600">
                    <tr><td className="px-4 py-2.5 font-mono text-xs">title</td><td className="px-4 py-2.5 text-red-500 font-medium">Yes</td><td className="px-4 py-2.5">Video metadata title; also becomes the output filename slug</td></tr>
                    <tr className="bg-gray-50"><td className="px-4 py-2.5 font-mono text-xs">audio_url</td><td className="px-4 py-2.5 text-red-500 font-medium">Yes</td><td className="px-4 py-2.5">Audio source — any supported URL scheme</td></tr>
                    <tr><td className="px-4 py-2.5 font-mono text-xs">images</td><td className="px-4 py-2.5 text-orange-500 font-medium">One of</td><td className="px-4 py-2.5">Array of timed slides with url, marker (HH:MM:SS), and optional title</td></tr>
                    <tr className="bg-gray-50"><td className="px-4 py-2.5 font-mono text-xs">image_url</td><td className="px-4 py-2.5 text-orange-500 font-medium">One of</td><td className="px-4 py-2.5">Single static cover image used for the full video duration</td></tr>
                    <tr><td className="px-4 py-2.5 font-mono text-xs">description</td><td className="px-4 py-2.5 text-gray-400">No</td><td className="px-4 py-2.5">Embedded as video comment/description metadata</td></tr>
                    <tr className="bg-gray-50"><td className="px-4 py-2.5 font-mono text-xs">options</td><td className="px-4 py-2.5 text-gray-400">No</td><td className="px-4 py-2.5">Output format, quality, and encoding options (see below)</td></tr>
                  </tbody>
                </table>
              </div>

              <div className="overflow-x-auto">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">options object</p>
                <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Option</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Default</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-600">
                    <tr><td className="px-4 py-2.5 font-mono text-xs">format</td><td className="px-4 py-2.5 font-mono text-xs">mp4</td><td className="px-4 py-2.5">Output container: mp4, mkv, or webm</td></tr>
                    <tr className="bg-gray-50"><td className="px-4 py-2.5 font-mono text-xs">crf</td><td className="px-4 py-2.5 font-mono text-xs">23</td><td className="px-4 py-2.5">Video quality 0–51; lower = better. Ignored if video_bitrate is set.</td></tr>
                    <tr><td className="px-4 py-2.5 font-mono text-xs">video_bitrate</td><td className="px-4 py-2.5 font-mono text-xs">null</td><td className="px-4 py-2.5">e.g. "2M" — overrides crf if set</td></tr>
                    <tr className="bg-gray-50"><td className="px-4 py-2.5 font-mono text-xs">audio_bitrate</td><td className="px-4 py-2.5 font-mono text-xs">192k</td><td className="px-4 py-2.5">Audio encoding bitrate</td></tr>
                    <tr><td className="px-4 py-2.5 font-mono text-xs">resolution</td><td className="px-4 py-2.5 font-mono text-xs">1920x1080</td><td className="px-4 py-2.5">Output canvas size; images are letterboxed/padded to fit</td></tr>
                    <tr className="bg-gray-50"><td className="px-4 py-2.5 font-mono text-xs">normalize_audio</td><td className="px-4 py-2.5 font-mono text-xs">false</td><td className="px-4 py-2.5">Apply FFmpeg loudnorm filter to even out audio levels</td></tr>
                  </tbody>
                </table>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Response — 202 Accepted</p>
                <CodeBlock lang="json" code={`{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "progress_url": "http://localhost:8000/jobs/550e8400-.../progress",
  "status_url": "http://localhost:8000/jobs/550e8400-.../status",
  "download_url": "http://localhost:8000/jobs/550e8400-.../download"
}`} />
              </div>
            </Endpoint>
          </Section>

          <Section id="progress" title="GET /jobs/{job_id}/progress">
            <Endpoint method="GET" path="/jobs/{job_id}/progress" badge="text/event-stream">
              <p className="text-gray-600 text-sm">Stream conversion progress as <strong>Server-Sent Events (SSE)</strong>. Keep the connection open until a <code className="font-mono text-xs bg-gray-100 px-1 rounded">complete</code> or <code className="font-mono text-xs bg-gray-100 px-1 rounded">error</code> event is received.</p>

              <div className="overflow-x-auto">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Event types</p>
                <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">type</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Fields</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-600">
                    <tr><td className="px-4 py-2.5 font-mono text-xs text-blue-700">progress</td><td className="px-4 py-2.5 font-mono text-xs">percent, time_processed</td><td className="px-4 py-2.5">Incremental progress update</td></tr>
                    <tr className="bg-gray-50"><td className="px-4 py-2.5 font-mono text-xs text-emerald-700">complete</td><td className="px-4 py-2.5 font-mono text-xs">download_url</td><td className="px-4 py-2.5">Conversion finished successfully</td></tr>
                    <tr><td className="px-4 py-2.5 font-mono text-xs text-red-700">error</td><td className="px-4 py-2.5 font-mono text-xs">message</td><td className="px-4 py-2.5">Conversion failed</td></tr>
                    <tr className="bg-gray-50"><td className="px-4 py-2.5 font-mono text-xs text-gray-500">ping</td><td className="px-4 py-2.5 font-mono text-xs">—</td><td className="px-4 py-2.5">Keep-alive heartbeat (every 30s of idle)</td></tr>
                  </tbody>
                </table>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Example stream</p>
                <CodeBlock lang="text" code={`data: {"type":"progress","percent":12.5,"time_processed":"00:00:45"}
data: {"type":"progress","percent":54.1,"time_processed":"00:03:12"}
data: {"type":"complete","download_url":"http://localhost:8000/jobs/.../download"}`} />
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">curl example</p>
                <CodeBlock lang="bash" code={`curl -N \\
  -H "X-API-Key: your-secret-key" \\
  http://localhost:8000/jobs/JOB_ID/progress`} />
              </div>
            </Endpoint>
          </Section>

          <Section id="status" title="GET /jobs/{job_id}/status">
            <Endpoint method="GET" path="/jobs/{job_id}/status" badge="application/json">
              <p className="text-gray-600 text-sm">Non-streaming status snapshot. Useful when SSE is not convenient (e.g. polling from a script).</p>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Response — 200 OK</p>
                <CodeBlock lang="json" code={`{
  "job_id": "550e8400-...",
  "status": "processing",
  "percent": 54.1,
  "time_processed": "00:03:12",
  "error": null,
  "download_url": null
}`} />
              </div>
              <p className="text-sm text-gray-500"><code className="font-mono text-xs bg-gray-100 px-1 rounded">status</code> is one of: <code className="font-mono text-xs">pending</code> | <code className="font-mono text-xs">processing</code> | <code className="font-mono text-xs">complete</code> | <code className="font-mono text-xs">error</code>. <code className="font-mono text-xs">download_url</code> is populated when status is <code className="font-mono text-xs">complete</code>.</p>
            </Endpoint>
          </Section>

          <Section id="download" title="GET /jobs/{job_id}/download">
            <Endpoint method="GET" path="/jobs/{job_id}/download" badge="video/mp4">
              <p className="text-gray-600 text-sm">Download the generated video file. Only available when the job status is <code className="font-mono text-xs bg-gray-100 px-1 rounded">complete</code>.</p>
              <p className="text-gray-600 text-sm">Returns the file as an attachment with the slug-based filename (e.g. <code className="font-mono text-xs bg-gray-100 px-1 rounded">my-podcast-episode-1.mp4</code>).</p>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">curl example</p>
                <CodeBlock lang="bash" code={`curl -L \\
  -H "X-API-Key: your-secret-key" \\
  http://localhost:8000/jobs/JOB_ID/download \\
  -o my-podcast-episode-1.mp4`} />
              </div>
            </Endpoint>
          </Section>

          <Section id="full-example" title="Full Example">
            <p className="text-gray-600 text-sm">End-to-end example using curl — submit a job, stream progress, then download.</p>
            <CodeBlock lang="bash" code={`# 1. Submit conversion job
JOB=$(curl -s -X POST http://localhost:8000/convert \\
  -H "X-API-Key: your-secret-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "My Podcast Episode 1",
    "description": "A great episode about things.",
    "audio_url": "https://example.com/episode1.mp3",
    "images": [
      {"url": "https://example.com/cover.jpg",  "marker": "00:00:00", "title": "Intro"},
      {"url": "https://example.com/topic1.jpg", "marker": "00:02:30", "title": "Part 1"},
      {"url": "https://example.com/topic2.jpg", "marker": "00:18:00", "title": "Part 2"},
      {"url": "https://example.com/outro.jpg",  "marker": "00:45:00", "title": "Outro"}
    ],
    "options": {"resolution": "1920x1080", "crf": 23, "normalize_audio": true}
  }')
JOB_ID=$(echo $JOB | python3 -c "import sys,json; print(json.load(sys.stdin)['job_id'])")

# 2. Stream progress (blocks until complete)
curl -N -H "X-API-Key: your-secret-key" \\
  http://localhost:8000/jobs/$JOB_ID/progress

# 3. Download the video
curl -L -H "X-API-Key: your-secret-key" \\
  http://localhost:8000/jobs/$JOB_ID/download \\
  -o episode1.mp4`} />
          </Section>

        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-6 text-center">
        <p className="text-gray-500 text-sm">
          A service by{' '}
          <a href="https://rumsan.com" target="_blank" rel="noreferrer" className="text-blue-600 font-semibold hover:underline">
            Rumsan
          </a>
          {' '}— Impact Innovation Company
        </p>
      </footer>
    </div>
  )
}
