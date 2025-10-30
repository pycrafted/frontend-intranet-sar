"use client"

import { LayoutWrapper } from "@/components/layout-wrapper"
import { ChatInterface } from "@/components/social/chat-interface"

export default function ReseauSocialPage() {
  return (
    <LayoutWrapper>
      <div className="w-full">
        <ChatInterface />
      </div>
    </LayoutWrapper>
  )
}
