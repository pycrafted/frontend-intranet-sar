import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

interface StandardLoaderProps {
  title?: string
  message?: string
  showRetry?: boolean
  onRetry?: () => void
  error?: string | null
}

export function StandardLoader({ 
  title = "Chargement...", 
  message = "Veuillez patienter pendant que nous récupérons les données.",
  showRetry = false,
  onRetry,
  error = null
}: StandardLoaderProps) {
  if (error) {
    return (
      <div className="w-full space-y-6">
        <Card className="p-12 text-center rounded-lg border-red-200 bg-red-50">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <Search className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-800">Erreur de chargement</h3>
              <p className="text-red-600">{error}</p>
            </div>
            {showRetry && onRetry && (
              <Button
                variant="outline"
                onClick={onRetry}
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                Réessayer
              </Button>
            )}
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      <Card className="p-12 text-center rounded-lg">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-muted-foreground">{message}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
