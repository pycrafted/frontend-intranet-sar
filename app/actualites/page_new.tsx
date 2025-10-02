"use client"

import { useState } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Calendar, User, Eye, Filter, Heart, MessageCircle, Share, MoreHorizontal, Plus, Bell, BarChart3, CheckSquare, Clock, CheckCircle, Circle } from "lucide-react"

const newsArticles = [
  {
    id: 1,
    type: "poll",
    title: "Sondage : Satisfaction des employés",
    question: "Comment évaluez-vous votre niveau de satisfaction au travail ?",
    options: [
      { id: 1, text: "Très satisfait", votes: 45, percentage: 35 },
      { id: 2, text: "Satisfait", votes: 52, percentage: 40 },
      { id: 3, text: "Neutre", votes: 20, percentage: 15 },
      { id: 4, text: "Mécontent", votes: 8, percentage: 6 },
      { id: 5, text: "Très mécontent", votes: 5, percentage: 4 }
    ],
    totalVotes: 130,
    date: "2024-03-15",
    time: "14:30",
    author: "Marie Dubois",
    authorRole: "Directrice Générale",
    authorAvatar: "/placeholder-user.jpg",
    category: "RH",
    tags: ["sondage", "satisfaction", "employés"],
    likes: 24,
    comments: 8,
    shares: 3,
    isPinned: true,
    endDate: "2024-03-25"
  },
  {
    id: 2,
    type: "news",
    title: "Résultats financiers exceptionnels du premier trimestre",
    content:
      "SAR enregistre une performance remarquable avec une croissance de 15% par rapport à l'année précédente. Ces résultats témoignent de l'efficacité de notre stratégie de développement et de l'engagement de nos équipes. Bravo à tous ! 📈",
    date: "2024-03-12",
    time: "09:15",
    author: "Jean-Pierre Martin",
    authorRole: "Directeur Financier",
    authorAvatar: "/placeholder-user.jpg",
    category: "Finance",
    tags: ["finance", "résultats", "croissance"],
    likes: 45,
    comments: 12,
    shares: 7,
    image: "/financial-charts-graphs.png",
    isPinned: false
  },
  {
    id: 3,
    type: "checklist",
    title: "Suivi du projet d'extension de l'usine",
    description: "Checklist pour suivre l'avancement du projet d'extension de notre usine principale",
    items: [
      { id: 1, text: "Approbation des plans architecturaux", completed: true, completedBy: "Ahmed Benali", completedDate: "2024-03-10" },
      { id: 2, text: "Obtention des permis de construire", completed: true, completedBy: "Marie Dubois", completedDate: "2024-03-12" },
      { id: 3, text: "Sélection des entrepreneurs", completed: false, assignedTo: "Jean-Pierre Martin", dueDate: "2024-03-20" },
      { id: 4, text: "Début des travaux de fondation", completed: false, assignedTo: "Ahmed Benali", dueDate: "2024-03-25" },
      { id: 5, text: "Installation des équipements", completed: false, assignedTo: "Sophie Laurent", dueDate: "2024-04-15" }
    ],
    progress: 40,
    totalItems: 5,
    completedItems: 2,
    date: "2024-03-08",
    time: "11:20",
    author: "Ahmed Benali",
    authorRole: "Directeur Technique",
    authorAvatar: "/placeholder-user.jpg",
    category: "Production",
    tags: ["projet", "extension", "suivi"],
    likes: 32,
    comments: 9,
    shares: 4,
    isPinned: false
  }
]

const categories = ["Toutes", "Sécurité", "Finance", "Formation", "Production", "Partenariat", "Environnement"]

const newsCategories = [
  { id: "toutes", label: "Toutes", active: true },
  { id: "securite", label: "Sécurité", active: false },
  { id: "finance", label: "Finance", active: false },
  { id: "formation", label: "Formation", active: false },
  { id: "production", label: "Production", active: false },
  { id: "partenariat", label: "Partenariat", active: false },
  { id: "environnement", label: "Environnement", active: false },
  { id: "rh", label: "Ressources Humaines", active: false },
]

export default function ActualitesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Toutes")
  const [filteredArticles, setFilteredArticles] = useState(newsArticles)
  const [activeNavCategory, setActiveNavCategory] = useState("toutes")

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    filterArticles(term, selectedCategory)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    filterArticles(searchTerm, category)
  }

  const handleNavCategoryChange = (categoryId: string) => {
    setActiveNavCategory(categoryId)

    const categoryMap: { [key: string]: string } = {
      toutes: "Toutes",
      securite: "Sécurité",
      finance: "Finance",
      formation: "Formation",
      production: "Production",
      partenariat: "Partenariat",
      environnement: "Environnement",
      rh: "Formation",
    }

    const mappedCategory = categoryMap[categoryId] || "Toutes"
    setSelectedCategory(mappedCategory)
    filterArticles(searchTerm, mappedCategory)
  }

  const filterArticles = (term: string, category: string) => {
    let filtered = newsArticles

    if (category !== "Toutes") {
      filtered = filtered.filter((article) => article.category === category)
    }

    if (term) {
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(term.toLowerCase()) ||
          (article.content && article.content.toLowerCase().includes(term.toLowerCase())) ||
          (article.question && article.question.toLowerCase().includes(term.toLowerCase())) ||
          (article.description && article.description.toLowerCase().includes(term.toLowerCase())) ||
          article.tags.some((tag) => tag.toLowerCase().includes(term.toLowerCase())),
      )
    }

    setFilteredArticles(filtered)
  }

  const pinnedArticles = filteredArticles.filter(article => article.isPinned)
  const regularArticles = filteredArticles.filter(article => !article.isPinned)

  const renderPollCard = (article: any) => (
    <Card key={article.id} className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow rounded-lg">
      <CardContent className="p-0">
        {/* Header du sondage */}
        <div className="flex items-center justify-between p-4 pb-2">
          <div className="flex items-center gap-3">
            <img
              src={article.authorAvatar}
              alt={article.author}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{article.author}</h3>
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                  {article.category}
                </Badge>
                <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                  <BarChart3 className="w-3 h-3 mr-1" />
                  Sondage
                </Badge>
                {article.isPinned && (
                  <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                    📌 Épinglé
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-500">{article.authorRole}</p>
              <p className="text-xs text-gray-400">
                {new Date(article.date).toLocaleDateString("fr-FR")} à {article.time}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>

        {/* Contenu du sondage */}
        <div className="px-4 pb-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{article.title}</h2>
          <p className="text-gray-700 leading-relaxed mb-4">{article.question}</p>
          
          {/* Options du sondage */}
          <div className="space-y-3 mb-4">
            {article.options.map((option: any) => (
              <div key={option.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{option.text}</span>
                  <span className="text-sm text-gray-500">{option.votes} votes ({option.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${option.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
            <span>Total: {article.totalVotes} votes</span>
            <span>Fin: {new Date(article.endDate).toLocaleDateString("fr-FR")}</span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {article.tags.map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-xs text-blue-600 border-blue-200">
                #{tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Actions sociales */}
        <div className="border-t border-gray-100 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-500">
                <Heart className="w-4 h-4 mr-1" />
                {article.likes}
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-500">
                <MessageCircle className="w-4 h-4 mr-1" />
                {article.comments}
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-green-500">
                <Share className="w-4 h-4 mr-1" />
                {article.shares}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderChecklistCard = (article: any) => (
    <Card key={article.id} className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow rounded-lg">
      <CardContent className="p-0">
        {/* Header de la checklist */}
        <div className="flex items-center justify-between p-4 pb-2">
          <div className="flex items-center gap-3">
            <img
              src={article.authorAvatar}
              alt={article.author}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{article.author}</h3>
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                  {article.category}
                </Badge>
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                  <CheckSquare className="w-3 h-3 mr-1" />
                  Checklist
                </Badge>
                {article.isPinned && (
                  <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                    📌 Épinglé
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-500">{article.authorRole}</p>
              <p className="text-xs text-gray-400">
                {new Date(article.date).toLocaleDateString("fr-FR")} à {article.time}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>

        {/* Contenu de la checklist */}
        <div className="px-4 pb-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{article.title}</h2>
          <p className="text-gray-700 leading-relaxed mb-4">{article.description}</p>
          
          {/* Barre de progression */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progression</span>
              <span className="text-sm text-gray-500">{article.completedItems}/{article.totalItems} tâches</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${article.progress}%` }}
              ></div>
            </div>
          </div>

          {/* Items de la checklist */}
          <div className="space-y-3 mb-4">
            {article.items.map((item: any) => (
              <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 mt-0.5">
                  {item.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {item.text}
                  </p>
                  {item.completed ? (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Terminé par {item.completedBy} le {new Date(item.completedDate).toLocaleDateString("fr-FR")}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">
                      <Clock className="w-3 h-3 inline mr-1" />
                      Assigné à {item.assignedTo} - Échéance: {new Date(item.dueDate).toLocaleDateString("fr-FR")}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {article.tags.map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-xs text-blue-600 border-blue-200">
                #{tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Actions sociales */}
        <div className="border-t border-gray-100 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-500">
                <Heart className="w-4 h-4 mr-1" />
                {article.likes}
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-500">
                <MessageCircle className="w-4 h-4 mr-1" />
                {article.comments}
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-green-500">
                <Share className="w-4 h-4 mr-1" />
                {article.shares}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderNewsCard = (article: any) => (
    <Card key={article.id} className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow rounded-lg">
      <CardContent className="p-0">
        {/* Header du post */}
        <div className="flex items-center justify-between p-4 pb-2">
          <div className="flex items-center gap-3">
            <img
              src={article.authorAvatar}
              alt={article.author}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{article.author}</h3>
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                  {article.category}
                </Badge>
                {article.isPinned && (
                  <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                    📌 Épinglé
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-500">{article.authorRole}</p>
              <p className="text-xs text-gray-400">
                {new Date(article.date).toLocaleDateString("fr-FR")} à {article.time}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>

        {/* Contenu du post */}
        <div className="px-4 pb-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{article.title}</h2>
          <p className="text-gray-700 leading-relaxed mb-3">{article.content}</p>
          
          {/* Image */}
          {article.image && (
            <div className="mb-3 rounded-lg overflow-hidden">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {article.tags.map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-xs text-blue-600 border-blue-200">
                #{tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Actions sociales */}
        <div className="border-t border-gray-100 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-500">
                <Heart className="w-4 h-4 mr-1" />
                {article.likes}
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-500">
                <MessageCircle className="w-4 h-4 mr-1" />
                {article.comments}
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-green-500">
                <Share className="w-4 h-4 mr-1" />
                {article.shares}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <LayoutWrapper>
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Feed principal - Style Talkspirit */}
        <div className="space-y-4">
          {/* Articles épinglés */}
          {pinnedArticles.map((article) => {
            if (article.type === "poll") {
              return renderPollCard(article)
            } else if (article.type === "checklist") {
              return renderChecklistCard(article)
            } else {
              return renderNewsCard(article)
            }
          })}

          {/* Articles réguliers */}
          {regularArticles.map((article) => {
            if (article.type === "poll") {
              return renderPollCard(article)
            } else if (article.type === "checklist") {
              return renderChecklistCard(article)
            } else {
              return renderNewsCard(article)
            }
          })}
        </div>

        {/* Empty State */}
        {filteredArticles.length === 0 && (
          <Card className="p-12 text-center rounded-lg">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Aucun article trouvé</h3>
                <p className="text-muted-foreground">Essayez de modifier vos critères de recherche ou de filtrage.</p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCategory("Toutes")
                  setFilteredArticles(newsArticles)
                  setActiveNavCategory("toutes")
                }}
              >
                Réinitialiser les filtres
              </Button>
            </div>
          </Card>
        )}
      </div>
    </LayoutWrapper>
  )
}

