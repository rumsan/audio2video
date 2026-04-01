import { useEffect } from 'react'

const SITE_NAME = 'Audio2Video'
const DEFAULT_DESCRIPTION =
  'The easiest way to convert a podcast, lecture, or music file into a shareable video for YouTube, Facebook, TikTok, and more. Add timed image slides and chapter markers.'

/**
 * Sets the page <title> and <meta name="description"> for the current route.
 * Call at the top of each page component.
 */
export function useSeoMeta(title: string, description: string = DEFAULT_DESCRIPTION) {
  useEffect(() => {
    // Update document title
    document.title = title
      ? `${title} | ${SITE_NAME}`
      : `${SITE_NAME} – Convert Audio to YouTube & Facebook Video`

    // Update meta description
    let metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (!metaDesc) {
      metaDesc = document.createElement('meta')
      metaDesc.name = 'description'
      document.head.appendChild(metaDesc)
    }
    metaDesc.content = description

    // Update OG title
    const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]')
    if (ogTitle) ogTitle.content = title

    // Update OG description
    const ogDesc = document.querySelector<HTMLMetaElement>('meta[property="og:description"]')
    if (ogDesc) ogDesc.content = description

    // Update canonical
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (canonical) canonical.href = window.location.href.split('?')[0]
  }, [title, description])
}
