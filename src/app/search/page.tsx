'use client'
// src/app/search/page.tsx
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Header from '@/components/layout/Header'
import ModelGrid from '@/components/model/ModelGrid'

function SearchResults() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6">
      <ModelGrid
        title={query ? `Results for "${query}"` : 'Search Models'}
        initialFilters={{ search: query }}
      />
    </div>
  )
}

export default function SearchPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <Suspense fallback={<div className="py-24 text-center text-stone-500">Loading...</div>}>
        <SearchResults />
      </Suspense>
    </div>
  )
}
