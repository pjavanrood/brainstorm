"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CommentForm } from "./CommentForm"

interface Author {
  id: string
  name: string | null
}

interface Reply {
  id: string
  content: string
  createdAt: string
  author: Author
}

interface Comment {
  id: string
  content: string
  createdAt: string
  author: Author
  replies: Reply[]
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function ReplyItem({ reply, currentUserId, onDelete }: { reply: Reply; currentUserId: string | null; onDelete: (id: string) => void }) {
  async function handleDelete() {
    if (!window.confirm("Delete this reply?")) return
    const res = await fetch(`/api/comments/${reply.id}`, { method: "DELETE" })
    if (res.ok) onDelete(reply.id)
  }

  return (
    <div className="py-3">
      <div className="flex items-baseline gap-3 mb-1">
        <span className="font-semibold text-sm text-ink">{reply.author.name}</span>
        <span className="text-xs text-muted tabular-nums">{timeAgo(reply.createdAt)}</span>
      </div>
      <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">{reply.content}</p>
      {currentUserId === reply.author.id && (
        <button
          onClick={handleDelete}
          className="mt-1 text-xs text-red-400 hover:text-red-600 transition-colors"
        >
          Delete
        </button>
      )}
    </div>
  )
}

function CommentItem({ comment, ideaId, currentUserId, onDelete }: { comment: Comment; ideaId: string; currentUserId: string | null; onDelete: (id: string) => void }) {
  const router = useRouter()
  const [replying, setReplying] = useState(false)
  const [replies, setReplies] = useState(comment.replies)

  async function handleDelete() {
    if (!window.confirm("Delete this comment and its replies?")) return
    const res = await fetch(`/api/comments/${comment.id}`, { method: "DELETE" })
    if (res.ok) onDelete(comment.id)
  }

  function handleReplyAdded() {
    setReplying(false)
    router.refresh()
  }

  return (
    <div>
      <div className="py-4">
        <div className="flex items-baseline gap-3 mb-1.5">
          <span className="font-semibold text-sm text-ink">{comment.author.name}</span>
          <span className="text-xs text-muted tabular-nums">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">{comment.content}</p>
        <div className="flex gap-3 mt-2">
          <button
            onClick={() => setReplying(!replying)}
            className="text-xs text-muted hover:text-accent transition-colors"
          >
            {replying ? "Cancel" : "Reply"}
          </button>
          {currentUserId === comment.author.id && (
            <button
              onClick={handleDelete}
              className="text-xs text-red-400 hover:text-red-600 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {replying && (
        <div className="ml-6 pl-4 border-l border-hairline mb-2">
          <CommentForm
            ideaId={ideaId}
            parentId={comment.id}
            currentUserId={currentUserId}
            autoFocus
            placeholder="Write a reply…"
            onSuccess={handleReplyAdded}
          />
        </div>
      )}

      {replies.length > 0 && (
        <div className="ml-6 pl-4 border-l border-hairline">
          {replies.map((reply) => (
            <ReplyItem
              key={reply.id}
              reply={reply}
              currentUserId={currentUserId}
              onDelete={(id) => setReplies((prev) => prev.filter((r) => r.id !== id))}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface CommentThreadProps {
  comments: Comment[]
  ideaId: string
  currentUserId: string | null
}

export function CommentThread({ comments: initialComments, ideaId, currentUserId }: CommentThreadProps) {
  const [comments, setComments] = useState(initialComments)

  return (
    <div>
      <div className="divide-y divide-hairline">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            ideaId={ideaId}
            currentUserId={currentUserId}
            onDelete={(id) => setComments((prev) => prev.filter((c) => c.id !== id))}
          />
        ))}
      </div>

      {comments.length === 0 && (
        <p className="text-sm text-muted py-6">No comments yet. Be the first.</p>
      )}

      <div className="mt-6 pt-6 border-t border-hairline">
        <CommentForm ideaId={ideaId} currentUserId={currentUserId} />
      </div>
    </div>
  )
}
