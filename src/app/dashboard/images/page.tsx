export const dynamic = 'force-dynamic'

'use client'
// src/app/dashboard/images/page.tsx
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useDropzone } from 'react-dropzone'
import { ArrowLeft, Upload, Trash2, Star, Loader2 } from 'lucide-react'
import Header from '@/components/layout/Header'

interface ProfileImage {
  id: string
  url: string
  key: string
  order: number
  isMain: boolean
}

export default function ImagesPage() {
  const [images, setImages] = useState<ProfileImage[]>([])
  const [profileId, setProfileId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    fetch('/api/user')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setImages(data.data.profile?.images || [])
          setProfileId(data.data.profile?.id || null)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const uploadImage = async (file: File) => {
    // 1. Get presigned URL
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mimeType: file.type, folder: 'gallery', isPrivate: false }),
    })
    const { data } = await res.json()

    // 2. Upload directly to S3
    await fetch(data.uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    })

    // 3. Save to database
    const saveRes = await fetch('/api/profile-images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: data.key,
        url: data.publicUrl,
        order: images.length,
        isMain: images.length === 0,
      }),
    })
    const saved = await saveRes.json()
    if (saved.success) {
      setImages((prev) => [...prev, saved.data])
    }
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setUploading(true)
      setUploadProgress(0)

      for (let i = 0; i < acceptedFiles.length; i++) {
        await uploadImage(acceptedFiles[i])
        setUploadProgress(Math.round(((i + 1) / acceptedFiles.length) * 100))
      }

      setUploading(false)
      setUploadProgress(0)
    },
    [images.length]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 20,
    disabled: uploading,
  })

  const deleteImage = async (imageId: string) => {
    if (!confirm('Remove this photo?')) return
    const res = await fetch(`/api/profile-images/${imageId}`, { method: 'DELETE' })
    if (res.ok) {
      setImages((prev) => prev.filter((img) => img.id !== imageId))
    }
  }

  const setMainImage = async (imageId: string) => {
    const res = await fetch(`/api/profile-images/${imageId}/main`, { method: 'PATCH' })
    if (res.ok) {
      setImages((prev) =>
        prev.map((img) => ({ ...img, isMain: img.id === imageId }))
      )
    }
  }

  return (
    <div className="min-h-screen bg-stone-950">
      <Header />

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/dashboard" className="text-stone-500 hover:text-stone-300">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1
            className="text-2xl font-light text-stone-100"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          >
            Photo Gallery
          </h1>
          <span className="ml-auto text-sm text-stone-500">
            {images.length} / 20 photos
          </span>
        </div>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`mb-8 cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
            isDragActive
              ? 'border-amber-600 bg-amber-950/20'
              : 'border-stone-700 bg-stone-900 hover:border-amber-800 hover:bg-stone-800'
          } ${uploading ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
              <p className="text-sm text-stone-400">Uploading... {uploadProgress}%</p>
              <div className="w-48 h-1.5 bg-stone-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-600 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Upload className="h-8 w-8 text-stone-500" />
              <div>
                <p className="text-sm font-medium text-stone-300">
                  {isDragActive ? 'Drop photos here' : 'Drag & drop photos, or click to browse'}
                </p>
                <p className="mt-1 text-xs text-stone-600">
                  JPEG, PNG, WebP · Up to 20 photos · Max 10MB each
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Image grid */}
        {loading ? (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-stone-900 animate-pulse" />
            ))}
          </div>
        ) : images.length === 0 ? (
          <p className="text-center text-stone-600 py-8">No photos yet. Upload your first photo above.</p>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {images.map((img) => (
              <div key={img.id} className="group relative aspect-square overflow-hidden rounded-xl bg-stone-900">
                <Image
                  src={img.url}
                  alt="Gallery photo"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 33vw, 25vw"
                />

                {/* Main badge */}
                {img.isMain && (
                  <div className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-amber-800/90 px-2 py-0.5 text-xs text-amber-200">
                    <Star className="h-3 w-3 fill-current" /> Main
                  </div>
                )}

                {/* Hover actions */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-stone-950/70 opacity-0 transition-opacity group-hover:opacity-100">
                  {!img.isMain && (
                    <button
                      onClick={() => setMainImage(img.id)}
                      className="flex items-center gap-1.5 rounded-lg bg-amber-800 px-3 py-1.5 text-xs font-medium text-amber-100 hover:bg-amber-700 transition-colors"
                    >
                      <Star className="h-3.5 w-3.5" /> Set Main
                    </button>
                  )}
                  <button
                    onClick={() => deleteImage(img.id)}
                    className="flex items-center gap-1.5 rounded-lg bg-red-900 px-3 py-1.5 text-xs font-medium text-red-200 hover:bg-red-800 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="mt-6 text-xs text-stone-600 text-center">
          The first photo or the one marked "Main" will appear as your profile picture.
        </p>
      </div>
    </div>
  )
}
