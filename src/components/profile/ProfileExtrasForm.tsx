'use client'
import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'

const SERVICES_LIST = [
  'GFE (Girlfriend Experience)', 'PSE', 'Dinner Date', 'Overnight Stay',
  'Travel Companion', 'Webcam / Virtual', 'Duo Available', 'Couples Welcome',
  'Massage', 'Tantric', 'Domination', 'Submissive', 'Role Play',
  'Fetish Friendly', 'BDSM', 'Striptease',
]

const BUILDS = ['Slim', 'Athletic', 'Average', 'Curvy', 'BBW', 'Petite', 'Tall']
const HAIR_COLORS = ['Blonde', 'Brunette', 'Black', 'Red', 'Auburn', 'Grey', 'Other']
const EYE_COLORS = ['Blue', 'Green', 'Brown', 'Hazel', 'Grey', 'Other']
const ETHNICITIES = ['Caucasian', 'Latin', 'Asian', 'African', 'Middle Eastern', 'Mixed', 'Other']
const LANGUAGES = ['English', 'French', 'Spanish', 'Arabic', 'Russian', 'Italian', 'German', 'Portuguese', 'Mandarin', 'Japanese', 'Korean', 'Other']
const HEIGHTS = ["4'10\"","4'11\"","5'0\"","5'1\"","5'2\"","5'3\"","5'4\"","5'5\"","5'6\"","5'7\"","5'8\"","5'9\"","5'10\"","5'11\"","6'0\"","6'1\"","6'2\""]

interface Props {
  profile: any
  onSave: (data: any) => Promise<void>
}

export default function ProfileExtrasForm({ profile, onSave }: Props) {
  const [form, setForm] = useState({
    services: profile?.services || [],
    incall: profile?.incall || false,
    outcall: profile?.outcall || false,
    travel: profile?.travel || false,
    height: profile?.height || '',
    build: profile?.build || '',
    hairColor: profile?.hairColor || '',
    eyeColor: profile?.eyeColor || '',
    ethnicity: profile?.ethnicity || '',
    nationality: profile?.nationality || '',
    languages: profile?.languages || [],
    smoker: profile?.smoker ?? null,
    rate1hr: profile?.rate1hr || '',
    rate2hr: profile?.rate2hr || '',
    rate3hr: profile?.rate3hr || '',
    rate4hr: profile?.rate4hr || '',
    rateHalf: profile?.rateHalf || '',
    rateFull: profile?.rateFull || '',
    rateDinner: profile?.rateDinner || '',
    rateOvernight: profile?.rateOvernight || '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const toggle = (field: 'services' | 'languages', val: string) =>
    setForm(p => ({ ...p, [field]: (p[field] as string[]).includes(val) ? (p[field] as string[]).filter(x => x !== val) : [...(p[field] as string[]), val] }))

  const handleSave = async () => {
    setSaving(true)
    await onSave({
      ...form,
      rate1hr: form.rate1hr ? parseInt(String(form.rate1hr)) : null,
      rate2hr: form.rate2hr ? parseInt(String(form.rate2hr)) : null,
      rate3hr: form.rate3hr ? parseInt(String(form.rate3hr)) : null,
      rate4hr: form.rate4hr ? parseInt(String(form.rate4hr)) : null,
      rateHalf: form.rateHalf ? parseInt(String(form.rateHalf)) : null,
      rateFull: form.rateFull ? parseInt(String(form.rateFull)) : null,
      rateDinner: form.rateDinner ? parseInt(String(form.rateDinner)) : null,
      rateOvernight: form.rateOvernight ? parseInt(String(form.rateOvernight)) : null,
    })
    setSaved(true); setSaving(false)
    setTimeout(() => setSaved(false), 3000)
  }

  const S = "w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 focus:border-amber-700 focus:outline-none"
  const L = "mb-3 block text-xs font-medium uppercase tracking-wider text-stone-500 font-sans"
  const Pill = ({ val, active, onClick }: any) => (
    <button type="button" onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs transition-colors ${active ? 'border-amber-700 bg-amber-900/30 text-amber-400' : 'border-stone-700 text-stone-400 hover:border-stone-500'}`}>
      {val}
    </button>
  )

  return (
    <div className="space-y-8" style={{ fontFamily: "DM Sans, system-ui, sans-serif" }}>

      <div>
        <p className={L}>Services Offered</p>
        <div className="flex flex-wrap gap-2">
          {SERVICES_LIST.map(s => <Pill key={s} val={s} active={form.services.includes(s)} onClick={() => toggle('services', s)} />)}
        </div>
      </div>

      <div>
        <p className={L}>Availability Type</p>
        <div className="flex gap-3 flex-wrap">
          {[['incall', 'Incall'], ['outcall', 'Outcall'], ['travel', 'Travel Available']].map(([key, label]) => (
            <button key={key} type="button" onClick={() => setForm(p => ({ ...p, [key]: !p[key as keyof typeof p] }))}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors ${form[key as keyof typeof form] ? 'border-amber-700 bg-amber-900/30 text-amber-400' : 'border-stone-700 text-stone-400 hover:border-stone-500'}`}>
              {form[key as keyof typeof form] && <Check className="h-3.5 w-3.5" />}{label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className={L}>Physical Attributes</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div><label className="mb-1 block text-xs text-stone-500">Height</label>
            <select value={form.height} onChange={e => setForm(p => ({ ...p, height: e.target.value }))} className={S}>
              <option value="">Select...</option>{HEIGHTS.map(h => <option key={h} value={h}>{h}</option>)}</select></div>
          <div><label className="mb-1 block text-xs text-stone-500">Build</label>
            <select value={form.build} onChange={e => setForm(p => ({ ...p, build: e.target.value }))} className={S}>
              <option value="">Select...</option>{BUILDS.map(b => <option key={b} value={b}>{b}</option>)}</select></div>
          <div><label className="mb-1 block text-xs text-stone-500">Hair Colour</label>
            <select value={form.hairColor} onChange={e => setForm(p => ({ ...p, hairColor: e.target.value }))} className={S}>
              <option value="">Select...</option>{HAIR_COLORS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          <div><label className="mb-1 block text-xs text-stone-500">Eye Colour</label>
            <select value={form.eyeColor} onChange={e => setForm(p => ({ ...p, eyeColor: e.target.value }))} className={S}>
              <option value="">Select...</option>{EYE_COLORS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          <div><label className="mb-1 block text-xs text-stone-500">Ethnicity</label>
            <select value={form.ethnicity} onChange={e => setForm(p => ({ ...p, ethnicity: e.target.value }))} className={S}>
              <option value="">Select...</option>{ETHNICITIES.map(e => <option key={e} value={e}>{e}</option>)}</select></div>
          <div><label className="mb-1 block text-xs text-stone-500">Nationality</label>
            <input value={form.nationality} onChange={e => setForm(p => ({ ...p, nationality: e.target.value }))} className={S} placeholder="e.g. Brazilian" /></div>
        </div>
      </div>

      <div>
        <p className={L}>Languages Spoken</p>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map(l => <Pill key={l} val={l} active={form.languages.includes(l)} onClick={() => toggle('languages', l)} />)}
        </div>
      </div>

      <div>
        <p className={L}>Smoker</p>
        <div className="flex gap-3 flex-wrap">
          {[['false', 'Non-smoker'], ['true', 'Smoker'], ['null', 'Prefer not to say']].map(([val, label]) => (
            <button key={val} type="button" onClick={() => setForm(p => ({ ...p, smoker: val === 'null' ? null : val === 'true' }))}
              className={`rounded-lg border px-4 py-2 text-sm transition-colors ${String(form.smoker) === val ? 'border-amber-700 bg-amber-900/30 text-amber-400' : 'border-stone-700 text-stone-400 hover:border-stone-500'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className={L}>Rates (USD) — Optional</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['rate1hr', '1 Hour'],['rate2hr', '2 Hours'],['rate3hr', '3 Hours'],['rate4hr', '4 Hours'],
            ['rateHalf', 'Half Day (6hrs)'],['rateFull', 'Full Day (12hrs)'],['rateDinner', 'Dinner Date'],['rateOvernight', 'Overnight'],
          ].map(([key, label]) => (
            <div key={key}>
              <label className="mb-1 block text-xs text-stone-500">{label}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-sm">$</span>
                <input type="number" value={form[key as keyof typeof form] as string}
                  onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 pl-7 pr-3 py-2.5 text-sm text-stone-100 focus:border-amber-700 focus:outline-none"
                  placeholder="0" />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-stone-600">Leave any blank to show "Contact for rates" on that option.</p>
      </div>

      <button onClick={handleSave} disabled={saving}
        className="flex items-center gap-2 rounded-xl bg-amber-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60">
        {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : saved ? <><Check className="h-4 w-4" />Saved!</> : 'Save Profile Details'}
      </button>
    </div>
  )
}
