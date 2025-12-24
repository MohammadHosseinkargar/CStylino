export default function AdminLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]" dir="rtl">
      <div className="text-center space-y-4">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground">در حال بارگذاری...</p>
      </div>
    </div>
  )
}

