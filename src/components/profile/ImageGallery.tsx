'use client'
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface GalleryImage {
  url: string
  id: string
}

export default function ImageGallery({ images, displayName }: { images: GalleryImage[]; displayName: string }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const open = (idx: number) => setLightboxIndex(idx)
  const close = () => setLightboxIndex(null)
  const prev = useCallback(() => setLightboxIndex(i => i !== null ? (i - 1 + images.length) % images.length : null), [images.length])
  const next = useCallback(() => setLightboxIndex(i => i !== null ? (i + 1) % images.length : null), [images.length])

  useEffect(() => {
    if (lightboxIndex === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxIndex, prev, next])

  if (images.length === 0) return null

  return (
    <>
      {/* Main image */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-stone-900 cursor-pointer" onClick={() => open(0)}>
        <Image src={images[0].url} alt={displayName} fill className="object-cover hover:scale-105 transition-transform duration-500" priority sizes="(max-width: 1024px) 100vw, 60vw" />
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 rounded-full bg-stone-950/70 px-2.5 py-1 text-xs text-stone-300 backdrop-blur-sm">
            1 / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {images.slice(1, 9).map((img, idx) => (
            <div key={img.id} onClick={() => open(idx + 1)}
              className="relative aspect-square overflow-hidden rounded-lg bg-stone-900 cursor-pointer group">
              <Image src={img.url} alt={displayName} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="25vw" />
              {idx === 7 && images.length > 9 && (
                <div className="absolute inset-0 flex items-center justify-center bg-stone-950/60">
                  <span className="text-white text-sm font-medium">+{images.length - 9}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/95 backdrop-blur-sm"
          onClick={close}>
          <button onClick={close} className="absolute top-4 right-4 rounded-full bg-stone-800 p-2 text-stone-400 hover:text-white transition-colors z-10">
            <X className="h-5 w-5" />
          </button>

          <button onClick={e => { e.stopPropagation(); prev() }}
            className="absolute left-4 rounded-full bg-stone-800/80 p-3 text-stone-400 hover:text-white transition-colors z-10">
            <ChevronLeft className="h-6 w-6" />
          </button>

          <div className="relative max-h-[90vh] max-w-[90vw] w-full h-full flex items-center justify-center"
            onClick={e => e.stopPropagation()}>
            <Image
              src={images[lightboxIndex].url}
              alt={displayName}
              width={1200}
              height={1600}
              className="max-h-[90vh] max-w-[90vw] w-auto h-auto object-contain rounded-lg"
            />
          </div>

          <button onClick={e => { e.stopPropagation(); next() }}
            className="absolute right-4 rounded-full bg-stone-800/80 p-3 text-stone-400 hover:text-white transition-colors z-10">
            <ChevronRight className="h-6 w-6" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
            <span className="text-stone-400 text-sm">{lightboxIndex + 1} / {images.length}</span>
          </div>

          {/* Dot indicators */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, idx) => (
              <button key={idx} onClick={e => { e.stopPropagation(); setLightboxIndex(idx) }}
                className={`rounded-full transition-all ${idx === lightboxIndex ? 'bg-white w-4 h-1.5' : 'bg-stone-600 w-1.5 h-1.5'}`} />
            ))}
          </div>
        </div>
      )}
    </>
  )
}
