"use client"

import { useState } from "react"
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

function CommentItem({ comment, ideaId }: { comment: Comment; ideaId: string }) {
  const [replying, setReplying] = useState(false)

  return (
    <div>
      <div className="py-4">
        <div className="flex items-baseline gap-3 mb-1.5">
          <span className="font-semibold text-sm text-ink">{comment.author.name}</span>
          <span className="text-xs text-muted tabular-nums">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">{comment.content}</p>
        <button
          onClick={() => setReplying(!replying)}
          className="mt-2 text-xs text-muted hover:text-accent transition-colors"
        >
          {replying ? "Cancel" : "Reply"}
        </button>
      </div>

      {replying && (
        <div className="ml-6 pl-4 border-l border-hairline mb-2">
          <CommentForm
            ideaId={ideaId}
            parentId={comment.id}
            autoFocus
            placeholder="Write a reply…"
            onSuccess={() => setReplying(false)}
          />
        </div>
      )}

      {comment.replies.length > 0 && (
        <div className="ml-6 pl-4 border-l border-hairline">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="py-3">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="font-semibold text-sm text-ink">{reply.author.name}</span>
                <span className="text-xs text-muted tabular-nums">{timeAgo(reply.createdAt)}</span>
              </div>
              <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">{reply.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface CommentThreadProps {
  comments: Comment[]
  ideaId: string
}

export function CommentThread({ comments, ideaId }: CommentThreadProps) {
  return (
    <div>
      <div className="divide-y divide-hairline">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} ideaId={ideaId} />
        ))}
      </div>

      {comments.length === 0 && (
        <p className="text-sm text-muted py-6">No comments yet. Be the first.</p>
      )}

      <div className="mt-6 pt-6 border-t border-hairline">
        <CommentForm ideaId={ideaId} />
      </div>
    </div>
  )
}
