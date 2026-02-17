export function LoadingState() {
  return (
    <div className="w-full space-y-4 animate-pulse">
      <div className="h-24 bg-muted rounded-[var(--radius-lg)]" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-32 bg-muted rounded-[var(--radius-md)]" />
        <div className="h-32 bg-muted rounded-[var(--radius-md)]" />
      </div>
      <div className="h-48 bg-muted rounded-[var(--radius-lg)]" />
    </div>
  );
}

export function ErrorState({ message = "Noget gik galt. Prøv venligst igen." }: { message?: string }) {
  return (
    <div className="w-full p-6 bg-destructive/10 border border-destructive/20 rounded-[var(--radius-lg)]">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-destructive/20 text-destructive flex items-center justify-center">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h4 className="text-destructive mb-1">Fejl</h4>
          <p className="text-sm text-destructive/80">{message}</p>
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="w-full py-16 text-center">
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="mb-2 text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
