'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, MessageSquare, Loader2, User } from 'lucide-react'
import Header from '@/components/layout/Header'

interface Message {
  id: string
  content: string
  senderId: string
  createdAt: string
  sender: {
    id: string
    name: string | null
    profile: { displayName: string; profileImageUrl: string | null } | null
    agency: { name: string; logoUrl: string | null } | null
  }
}

interface LinkedProfile {
  displayName: string
  profileImageUrl: string | null
  slug: string
  countryCode: string
  citySlug: string
}

interface ConversationMember {
  userId: string
  user: {
    id: string
    name: string | null
    role: string
    profile: { displayName: string; profileImageUrl: string | null; slug: string } | null
    agency: { name: string; logoUrl: string | null; slug: string } | null
  }
}

interface Conversation {
  id: string
  updatedAt: string
  profileId: string | null
  linkedProfile: LinkedProfile | null
  members: ConversationMember[]
  messages: Message[]
  _count: { messages: number }
}

function getDisplayName(user: ConversationMember['user']) {
  return user.profile?.displayName || user.agency?.name || user.name || 'Unknown'
}

function getAvatar(user: ConversationMember['user']) {
  return user.profile?.profileImageUrl || user.agency?.logoUrl || null
}

function ConversationListItem({
  convo,
  currentUserId,
  isSelected,
  onClick,
}: {
  convo: Conversation
  currentUserId: string
  isSelected: boolean
  onClick: () => void
}) {
  const other = convo.members.find(m => m.userId !== currentUserId)?.user
  const lastMsg = convo.messages[0]
  const hasUnread = convo._count.messages > 0
  const avatar = other ? getAvatar(other) : null
  const name = other ? getDisplayName(other) : 'Unknown'

  return (
    <button onClick={onClick}
      className={`w-full flex items-start gap-3 px-4 py-3 border-b border-stone-800/50 text-left transition-colors ${isSelected ? 'bg-stone-800' : 'hover:bg-stone-800/50'}`}>
      <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden bg-stone-700 flex items-center justify-center text-sm font-medium text-stone-400">
        {avatar
          ? <img src={avatar} className="h-full w-full object-cover" alt="" />
          : <span>{name[0]?.toUpperCase()}</span>
        }
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1">
          <p className={`text-sm truncate ${hasUnread ? 'font-semibold text-stone-100' : 'font-medium text-stone-300'}`}>
            {name}
          </p>
          {hasUnread && <span className="flex-shrink-0 h-2 w-2 rounded-full bg-amber-500" />}
        </div>
        {/* Model context badge */}
        {convo.linkedProfile && (
          <p className="text-xs text-amber-600 truncate">re: {convo.linkedProfile.displayName}</p>
        )}
        {lastMsg && <p className="text-xs text-stone-500 truncate mt-0.5">{lastMsg.content}</p>}
      </div>
    </button>
  )
}

export default function InboxPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [convoDetails, setConvoDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/user').then(r => r.json()).then(d => {
      if (!d.success) { router.push('/login'); return }
      setCurrentUserId(d.data.id)
    })
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    const res = await fetch('/api/messages')
    const data = await res.json()
    if (data.success) setConversations(data.data)
    setLoading(false)
  }

  const openConversation = async (id: string) => {
    setSelected(id)
    setLoadingMessages(true)
    const res = await fetch(`/api/messages/${id}`)
    const data = await res.json()
    if (data.success) {
      setMessages(data.data.messages)
      setConvoDetails(data.data.conversation)
    }
    setLoadingMessages(false)
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    fetchConversations()
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selected) return
    setSending(true)
    const res = await fetch(`/api/messages/${selected}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newMessage.trim() })
    })
    const data = await res.json()
    if (data.success) {
      setMessages(prev => [...prev, data.data])
      setNewMessage('')
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
      fetchConversations()
    }
    setSending(false)
  }

  const selectedConvo = conversations.find(c => c.id === selected)
  const otherMember = selectedConvo
    ? selectedConvo.members.find(m => m.userId !== currentUserId)?.user
    : convoDetails?.members?.find((m: ConversationMember) => m.userId !== currentUserId)?.user

  return (
    <div className="min-h-screen bg-stone-950">
      <Header />
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <div className="mb-4 flex items-center gap-3">
          <Link href="/dashboard" className="text-stone-500 hover:text-stone-300"><ArrowLeft className="h-4 w-4" /></Link>
          <h1 className="text-2xl font-light text-stone-100" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Inbox</h1>
        </div>

        <div className="flex gap-0 rounded-2xl border border-stone-800 overflow-hidden" style={{ height: '72vh' }}>
          {/* Conversation list */}
          <div className="w-72 flex-shrink-0 border-r border-stone-800 bg-stone-900 flex flex-col">
            <div className="px-4 py-3 border-b border-stone-800">
              <p className="text-xs font-medium uppercase tracking-wider text-stone-500">Conversations</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-5 w-5 text-stone-600 animate-spin" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <MessageSquare className="h-8 w-8 text-stone-700 mb-2" />
                  <p className="text-sm text-stone-600">No messages yet</p>
                </div>
              ) : (
                conversations.map(convo => (
                  <ConversationListItem
                    key={convo.id}
                    convo={convo}
                    currentUserId={currentUserId || ''}
                    isSelected={selected === convo.id}
                    onClick={() => openConversation(convo.id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Chat view */}
          <div className="flex-1 bg-stone-950 flex flex-col min-w-0">
            {!selected ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <MessageSquare className="h-12 w-12 text-stone-800 mb-3" />
                <p className="text-stone-600">Select a conversation</p>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="px-5 py-3 border-b border-stone-800 bg-stone-900">
                  {otherMember && (
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full overflow-hidden bg-stone-700 flex items-center justify-center text-sm flex-shrink-0">
                        {getAvatar(otherMember)
                          ? <img src={getAvatar(otherMember)!} className="h-full w-full object-cover" alt="" />
                          : getDisplayName(otherMember)[0]
                        }
                      </div>
                      <div>
                        <p className="text-sm font-medium text-stone-200">{getDisplayName(otherMember)}</p>
                        {/* Show which model this conversation is about */}
                        {selectedConvo?.linkedProfile && (
                          <Link
                            href={`/${selectedConvo.linkedProfile.countryCode.toLowerCase()}/${selectedConvo.linkedProfile.citySlug}/${selectedConvo.linkedProfile.slug}`}
                            className="text-xs text-amber-500 hover:text-amber-400"
                          >
                            re: {selectedConvo.linkedProfile.displayName} →
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-5 w-5 text-stone-600 animate-spin" />
                    </div>
                  ) : (
                    messages.map(msg => {
                      const isMe = msg.senderId === currentUserId
                      return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs lg:max-w-sm rounded-2xl px-4 py-2.5 ${isMe ? 'bg-amber-700 text-white rounded-br-sm' : 'bg-stone-800 text-stone-200 rounded-bl-sm'}`}>
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                            <p className={`text-xs mt-1 ${isMe ? 'text-amber-200' : 'text-stone-500'}`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={sendMessage} className="px-4 py-3 border-t border-stone-800 flex gap-2">
                  <input value={newMessage} onChange={e => setNewMessage(e.target.value)}
                    className="flex-1 rounded-xl border border-stone-700 bg-stone-800 px-4 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:border-amber-700 focus:outline-none"
                    placeholder="Type a message..." />
                  <button type="submit" disabled={sending || !newMessage.trim()}
                    className="flex items-center justify-center rounded-xl bg-amber-700 px-4 py-2.5 text-white hover:bg-amber-600 disabled:opacity-50 transition-colors">
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
