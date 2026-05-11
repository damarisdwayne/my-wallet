import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { Diagram, DiagramQuestion } from '@/types'
import { inputClass } from '../constants'

interface EditQuestionsDialogProps {
  open: boolean
  diagram: Diagram
  onOpenChange: (open: boolean) => void
  onSaveDiagram: (diagram: Diagram) => Promise<void>
}

export const EditQuestionsDialog = ({
  open,
  diagram,
  onOpenChange,
  onSaveDiagram,
}: EditQuestionsDialogProps) => {
  const [newQuestionText, setNewQuestionText] = useState('')
  const [editingQuestion, setEditingQuestion] = useState<DiagramQuestion | null>(null)
  const [editingQuestionText, setEditingQuestionText] = useState('')

  const addQuestion = async () => {
    const text = newQuestionText.trim()
    if (!text) return
    await onSaveDiagram({
      ...diagram,
      questions: [...diagram.questions, { id: `q-${Date.now()}`, text }],
    })
    setNewQuestionText('')
  }

  const removeQuestion = async (qId: string) => {
    await onSaveDiagram({ ...diagram, questions: diagram.questions.filter((q) => q.id !== qId) })
  }

  const saveEditQuestion = async () => {
    const text = editingQuestionText.trim()
    if (!text || !editingQuestion) return
    await onSaveDiagram({
      ...diagram,
      questions: diagram.questions.map((q) => (q.id === editingQuestion.id ? { ...q, text } : q)),
    })
    setEditingQuestion(null)
    setEditingQuestionText('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Perguntas — {diagram.name}</DialogTitle>
          <DialogDescription>Adicione, edite ou remova perguntas do diagrama.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 mt-2">
          {diagram.questions.map((q, i) => (
            <div
              key={q.id}
              className="flex items-start gap-2 py-2 border-b border-border last:border-0"
            >
              <span className="text-xs text-muted-foreground w-5 shrink-0 mt-2">{i + 1}.</span>
              {editingQuestion?.id === q.id ? (
                <div className="flex-1 flex gap-2">
                  <input
                    className={cn(inputClass, 'flex-1')}
                    value={editingQuestionText}
                    onChange={(e) => setEditingQuestionText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveEditQuestion()}
                  />
                  <button
                    onClick={saveEditQuestion}
                    className="px-2 py-1 rounded bg-primary text-primary-foreground text-xs"
                  >
                    OK
                  </button>
                  <button
                    onClick={() => setEditingQuestion(null)}
                    className="px-2 py-1 rounded bg-muted text-muted-foreground text-xs"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <>
                  <p className="flex-1 text-sm text-foreground py-1.5">{q.text}</p>
                  <button
                    onClick={() => {
                      setEditingQuestion(q)
                      setEditingQuestionText(q.text)
                    }}
                    className="p-1.5 rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => removeQuestion(q.id)}
                    className="p-1.5 rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
        <DialogFooter className="flex-col gap-2 mt-2">
          <div className="flex gap-2 w-full">
            <input
              className={cn(inputClass, 'flex-1')}
              placeholder="Nova pergunta..."
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addQuestion()}
            />
            <button
              onClick={addQuestion}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors shrink-0"
            >
              <Plus size={14} />
              Adicionar
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
