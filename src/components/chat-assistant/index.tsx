import { useRef, useState } from 'react'
import { useAtomValue } from 'jotai'
import { Bot, Send, Loader2 } from 'lucide-react'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { portfolioContextAtom, buildPortfolioContext } from '@/store/portfolio-context'
import { chatWithAssistant } from '@/services/gemini'
import type { ChatMessage } from '@/services/gemini'

const SUGGESTIONS = [
  'Como está minha carteira hoje?',
  'Estou bem diversificado?',
  'Qual categoria está mais desviada da meta?',
  'Quanto recebi de dividendos esse ano?',
]

const MessageBubble = ({ msg }: { msg: ChatMessage }) => {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center mr-2 mt-1 shrink-0">
          <Bot className="w-4 h-4 text-primary" />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-muted text-foreground rounded-bl-sm'
        }`}
      >
        {msg.text}
      </div>
    </div>
  )
}

export const ChatAssistant = () => {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const portfolioContext = useAtomValue(portfolioContextAtom)

  const getContext = () =>
    portfolioContext ? buildPortfolioContext(portfolioContext) : 'Carteira ainda não carregada.'

  const send = async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: ChatMessage = { role: 'user', text: text.trim() }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setLoading(true)

    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    }, 50)

    try {
      const reply = await chatWithAssistant(text.trim(), messages, getContext())
      setMessages([...next, { role: 'model', text: reply }])
    } catch {
      setMessages([
        ...next,
        { role: 'model', text: 'Erro ao conectar com o assistente. Tente novamente.' },
      ])
    } finally {
      setLoading(false)
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
      }, 50)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 w-13 h-13 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:scale-105 flex items-center justify-center"
        aria-label="Abrir assistente de investimentos"
      >
        <Bot className="w-6 h-6" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:w-[420px] p-0 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm font-semibold">Assistente de Investimentos</p>
            </div>
          </div>

          <ScrollArea className="flex-1 px-4 py-4" ref={scrollRef}>
            {messages.length === 0 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center pt-4">
                  Olá! Pergunte sobre sua carteira ou sobre investimentos em geral.
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="text-left text-xs px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} />
            ))}
            {loading && (
              <div className="flex justify-start mb-3">
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center mr-2 mt-1 shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </ScrollArea>

          <div className="px-4 py-3 border-t border-border">
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                placeholder="Pergunte algo sobre sua carteira..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send(input)}
                disabled={loading}
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || loading}
                className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
