"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'
import { 
  Users, 
  Building, 
  UserCheck,
  Target,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react'

interface DemographicChartProps {
  data: {
    department?: Record<string, number>
    role?: Record<string, number>
    age_group?: Record<string, number>
    experience?: Record<string, number>
  }
  title: string
  description?: string
}

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
]

export function DemographicChart({ data, title, description }: DemographicChartProps) {
  const getChartData = (dataObj: Record<string, number>) => {
    return Object.entries(dataObj).map(([key, value], idx) => ({
      name: key,
      value,
      percentage: dataObj ? (value / Object.values(dataObj).reduce((a, b) => a + b, 0)) * 100 : 0,
      color: COLORS[idx % COLORS.length]
    }))
  }

  const getPieData = (dataObj: Record<string, number>) => {
    return getChartData(dataObj).map((item, idx) => ({
      ...item,
      fill: COLORS[idx % COLORS.length]
    }))
  }

  const renderDepartmentChart = () => {
    if (!data.department) return null
    
    const chartData = getChartData(data.department)
    
    return (
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Building className="h-4 w-4" />
          Par Département
        </h4>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Graphique en barres */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: any) => [value, 'Réponses']}
                  labelFormatter={(label) => `Département: ${label}`}
                />
                <Bar 
                  dataKey="value" 
                  fill="#3B82F6" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Graphique circulaire */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={getPieData(data.department)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage.toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getPieData(data.department).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    )
  }

  const renderRoleChart = () => {
    if (!data.role) return null
    
    const chartData = getChartData(data.role)
    
    return (
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <UserCheck className="h-4 w-4" />
          Par Rôle
        </h4>
        
        <div className="space-y-3">
          {chartData.map((item, idx) => (
            <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={item.percentage} className="flex-1 h-2" />
                  <span className="text-xs text-gray-500 w-12 text-right">
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="ml-4 text-right">
                <p className="text-lg font-bold text-gray-900">{item.value}</p>
                <p className="text-xs text-gray-500">réponses</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderAgeGroupChart = () => {
    if (!data.age_group) return null
    
    const chartData = getChartData(data.age_group)
    
    return (
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Users className="h-4 w-4" />
          Par Tranche d'Âge
        </h4>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value: any) => [value, 'Réponses']}
                labelFormatter={(label) => `Âge: ${label}`}
              />
              <Bar 
                dataKey="value" 
                fill="#10B981" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  const renderExperienceChart = () => {
    if (!data.experience) return null
    
    const chartData = getChartData(data.experience)
    
    return (
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Target className="h-4 w-4" />
          Par Expérience
        </h4>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={getPieData(data.experience)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage.toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {getPieData(data.experience).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  const hasData = data.department || data.role || data.age_group || data.experience

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              {title}
            </CardTitle>
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {!hasData ? (
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto mb-2" />
              <p>Aucune donnée démographique disponible</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {renderDepartmentChart()}
            {renderRoleChart()}
            {renderAgeGroupChart()}
            {renderExperienceChart()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}


























