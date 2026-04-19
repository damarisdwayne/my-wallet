import * as RadixDialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Dialog = RadixDialog.Root
export const DialogTrigger = RadixDialog.Trigger
export const DialogClose = RadixDialog.Close

export const DialogPortal = ({ children }: { children: React.ReactNode }) => (
  <RadixDialog.Portal>{children}</RadixDialog.Portal>
)

export const DialogOverlay = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixDialog.Overlay>) => (
  <RadixDialog.Overlay
    className={cn(
      'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className,
    )}
    {...props}
  />
)

export const DialogContent = ({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixDialog.Content>) => (
  <DialogPortal>
    <DialogOverlay />
    <RadixDialog.Content
      className={cn(
        'fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-xl',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
        'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
        className,
      )}
      {...props}
    >
      {children}
      <RadixDialog.Close className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
        <X size={16} />
      </RadixDialog.Close>
    </RadixDialog.Content>
  </DialogPortal>
)

export const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mb-5 space-y-1', className)} {...props} />
)

export const DialogTitle = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixDialog.Title>) => (
  <RadixDialog.Title
    className={cn('text-base font-semibold text-foreground', className)}
    {...props}
  />
)

export const DialogDescription = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixDialog.Description>) => (
  <RadixDialog.Description className={cn('text-sm text-muted-foreground', className)} {...props} />
)

export const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mt-6 flex justify-end gap-2', className)} {...props} />
)
