"use client"

import dynamic from "next/dynamic"
import "@uiw/react-markdown-preview/markdown.css"

const MDPreview = dynamic(() => import("@uiw/react-markdown-preview"), { ssr: false })

export function MarkdownPreview({ source }: { source: string }) {
  return (
    <div data-color-mode="light">
      <MDPreview source={source} />
    </div>
  )
}
