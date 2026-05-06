content = open('src/app/admin/page.tsx').read()

# 1. Fix TABS
content = content.replace(
    "const TABS = ['Overview', 'Verifications', 'Bookings', 'Reviews', 'Inbox', 'Payments', 'Broadcast', 'Users']",
    "const TABS = ['Overview', 'Approvals', 'Verifications', 'Bookings', 'Reviews', 'Inbox', 'Payments', 'Broadcast', 'Users']"
)

# 2. Add badge for Approvals tab
if "t === 'Approvals' && (approvals.profiles.length" not in content:
    content = content.replace(
        "              {t === 'Verifications' && analytics?.verifications?.pending > 0 && (",
        """              {t === 'Approvals' && (approvals.profiles.length + approvals.agencies.length) > 0 && (
                <span className="ml-1.5 rounded-full bg-red-700 px-1.5 py-0.5 text-xs text-white">{approvals.profiles.length + approvals.agencies.length}</span>
              )}
              {t === 'Verifications' && analytics?.verifications?.pending > 0 && ("""
    )

# 3. Add Approvals tab content if missing
if "tab === 'Approvals'" not in content:
    tab_content = """            {tab === 'Approvals' && (
              <div className="space-y-6">
                {approvals.profiles.length === 0 && approvals.agencies.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-stone-700 py-12 text-center">
                    <p className="text-stone-500">No pending approvals</p>
                  </div>
                ) : (
                  <>
                    {approvals.profiles.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium uppercase tracking-wider text-stone-500 mb-3">Escorts ({approvals.profiles.length})</h3>
                        <div className="space-y-3">
                          {approvals.profiles.map((p: any) => (
                            <div key={p.id} className="rounded-xl border border-stone-800 bg-stone-900 p-4">
                              <div className="flex gap-4 flex-wrap">
                                {p.images?.[0] && <img src={p.images[0].url} alt="" className="h-16 w-16 rounded-lg object-cover flex-shrink-0" />}
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-stone-200">{p.displayName}</p>
                                  <p className="text-xs text-stone-500">{p.city}, {p.country}</p>
                                  <p className="text-xs text-stone-600">{p.user?.email}</p>
                                  {p.bio && <p className="text-xs text-stone-400 mt-1 line-clamp-2">{p.bio}</p>}
                                  <p className="text-xs text-stone-700 mt-1">Submitted {new Date(p.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="flex flex-col gap-2 flex-shrink-0">
                                  <a href={`/admin/preview/${p.id}`} target="_blank" className="rounded-lg border border-stone-700 px-3 py-1.5 text-xs text-stone-400 hover:border-amber-700 hover:text-amber-400 transition-colors text-center">👁 Preview</a>
                                  <button onClick={() => approvalAction(p.id, 'profile', 'APPROVED')} className="rounded-lg bg-emerald-900/30 border border-emerald-800 px-3 py-1.5 text-xs text-emerald-400 hover:bg-emerald-900/50 transition-colors">✓ Approve</button>
                                  <button onClick={() => { const notes = prompt('Rejection reason:'); approvalAction(p.id, 'profile', 'REJECTED', notes || undefined) }} className="rounded-lg bg-red-950/30 border border-red-900 px-3 py-1.5 text-xs text-red-400 hover:bg-red-950/50 transition-colors">✕ Reject</button>
                                  <button onClick={() => messageUser(p.user?.id)} className="rounded-lg border border-stone-700 px-3 py-1.5 text-xs text-stone-400 hover:border-amber-700 hover:text-amber-400 transition-colors">💬 Message</button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {approvals.agencies.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium uppercase tracking-wider text-stone-500 mb-3">Agencies ({approvals.agencies.length})</h3>
                        <div className="space-y-3">
                          {approvals.agencies.map((a: any) => (
                            <div key={a.id} className="rounded-xl border border-stone-800 bg-stone-900 p-4">
                              <div className="flex gap-4 flex-wrap">
                                {a.logoUrl && <img src={a.logoUrl} alt="" className="h-16 w-16 rounded-lg object-cover flex-shrink-0" />}
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-stone-200">{a.name}</p>
                                  <p className="text-xs text-stone-500">{a.city}, {a.country}</p>
                                  <p className="text-xs text-stone-600">{a.user?.email}</p>
                                  {a.bio && <p className="text-xs text-stone-400 mt-1 line-clamp-2">{a.bio}</p>}
                                  <p className="text-xs text-stone-700 mt-1">Submitted {new Date(a.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="flex flex-col gap-2 flex-shrink-0">
                                  <a href={`/admin/preview-agency/${a.id}`} target="_blank" className="rounded-lg border border-stone-700 px-3 py-1.5 text-xs text-stone-400 hover:border-amber-700 hover:text-amber-400 transition-colors text-center">👁 Preview</a>
                                  <button onClick={() => approvalAction(a.id, 'agency', 'APPROVED')} className="rounded-lg bg-emerald-900/30 border border-emerald-800 px-3 py-1.5 text-xs text-emerald-400 hover:bg-emerald-900/50 transition-colors">✓ Approve</button>
                                  <button onClick={() => { const notes = prompt('Rejection reason:'); approvalAction(a.id, 'agency', 'REJECTED', notes || undefined) }} className="rounded-lg bg-red-950/30 border border-red-900 px-3 py-1.5 text-xs text-red-400 hover:bg-red-950/50 transition-colors">✕ Reject</button>
                                  <button onClick={() => messageUser(a.user?.id)} className="rounded-lg border border-stone-700 px-3 py-1.5 text-xs text-stone-400 hover:border-amber-700 hover:text-amber-400 transition-colors">💬 Message</button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

"""
    content = content.replace("            {tab === 'Verifications' && (", tab_content + "            {tab === 'Verifications' && (")

# 4. Fix revenue line
lines = content.split('\n')
for i, line in enumerate(lines):
    if 'toLocaleString' in line and "{'}'}" in line:
        lines[i] = '                    <p className="text-xl font-light text-amber-400">${stats.reduce((s: number, d: any) => s + d.revenue, 0).toLocaleString()}</p>'
        print(f'Fixed revenue line {i+1}')
content = '\n'.join(lines)

with open('src/app/admin/page.tsx', 'w') as f:
    f.write(content)

print('TABS:', 'Approvals' in content)
print('Tab content:', "tab === 'Approvals'" in content)
print('Preview buttons:', '👁 Preview' in content)
