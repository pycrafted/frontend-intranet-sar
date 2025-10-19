"use client"

import { useState, useEffect } from 'react'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ImageTest } from '@/components/image-test'
import { useArticles } from '@/hooks/useArticles'
import { Loader2, Search, Image as ImageIcon, AlertTriangle } from 'lucide-react'

export default function TestImagesPage() {
  const [testUrl, setTestUrl] = useState('')
  const [customUrl, setCustomUrl] = useState('')
  const { articles, loading, error } = useArticles({})
  const [selectedArticle, setSelectedArticle] = useState<any>(null)

  // URL de test par défaut
  const defaultTestUrl = 'https://backend-intranet-sar-1.onrender.com/media/articles/img1.png'

  useEffect(() => {
    if (articles.length > 0 && !selectedArticle) {
      const articleWithImage = articles.find(article => article.image_url || article.image)
      if (articleWithImage) {
        setSelectedArticle(articleWithImage)
        setTestUrl(articleWithImage.image_url || articleWithImage.image || '')
      }
    }
  }, [articles, selectedArticle])

  const handleArticleSelect = (article: any) => {
    setSelectedArticle(article)
    setTestUrl(article.image_url || article.image || '')
  }

  const handleCustomTest = () => {
    if (customUrl.trim()) {
      setTestUrl(customUrl.trim())
      setSelectedArticle(null)
    }
  }

  const articlesWithImages = articles.filter(article => article.image_url || article.image)

  return (
    <LayoutWrapper>
      <div className="w-full space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <ImageIcon className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Test des Images</h1>
        </div>

        {/* Sélection d'article */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sélectionner un article</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Chargement des articles...</span>
              </div>
            ) : error ? (
              <Alert>
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  Erreur lors du chargement des articles: {error}
                </AlertDescription>
              </Alert>
            ) : articlesWithImages.length === 0 ? (
              <Alert>
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  Aucun article avec image trouvé.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  {articlesWithImages.length} article(s) avec image(s) trouvé(s)
                </p>
                <div className="grid gap-2 max-h-60 overflow-y-auto">
                  {articlesWithImages.map((article) => (
                    <div
                      key={article.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedArticle?.id === article.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleArticleSelect(article)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">
                            {article.title || 'Sans titre'}
                          </h3>
                          <p className="text-xs text-gray-500 truncate">
                            ID: {article.id} | Type: {article.type}
                          </p>
                          <p className="text-xs text-blue-600 truncate">
                            {article.image_url || article.image}
                          </p>
                        </div>
                        {selectedArticle?.id === article.id && (
                          <Badge variant="default" className="text-xs">
                            Sélectionné
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test d'URL personnalisée */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Test d'URL personnalisée</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="https://backend-intranet-sar-1.onrender.com/media/articles/img1.png"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleCustomTest} disabled={!customUrl.trim()}>
                <Search className="w-4 h-4 mr-2" />
                Tester
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Entrez une URL d'image pour la tester directement.
            </p>
          </CardContent>
        </Card>

        {/* Test de l'image sélectionnée */}
        {testUrl && (
          <ImageTest imageUrl={testUrl} />
        )}

        {/* Informations sur l'article sélectionné */}
        {selectedArticle && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations de l'article</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <strong>ID:</strong> {selectedArticle.id}
                </div>
                <div>
                  <strong>Titre:</strong> {selectedArticle.title || 'Sans titre'}
                </div>
                <div>
                  <strong>Type:</strong> {selectedArticle.type}
                </div>
                <div>
                  <strong>Content Type:</strong> {selectedArticle.content_type}
                </div>
                <div>
                  <strong>Image URL:</strong> 
                  <code className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                    {selectedArticle.image_url || 'N/A'}
                  </code>
                </div>
                <div>
                  <strong>Image Field:</strong> 
                  <code className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                    {selectedArticle.image || 'N/A'}
                  </code>
                </div>
                <div>
                  <strong>Date:</strong> {selectedArticle.date}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <p>
                Cette page vous permet de diagnostiquer les problèmes d'affichage des images :
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Sélectionnez un article avec une image</li>
                <li>Ou testez une URL d'image personnalisée</li>
                <li>Lancez les tests pour voir les détails techniques</li>
                <li>Vérifiez les logs dans la console du navigateur</li>
              </ul>
              <p className="text-xs text-gray-500">
                Les tests incluent la validation d'URL, les requêtes HEAD/GET, et le chargement de l'élément img.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </LayoutWrapper>
  )
}

