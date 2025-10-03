"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart,
  BarChart,
  Bar
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown,
  Activity,
  Calendar,
  Users
} from 'lucide-react'

interface TrendChartProps {
  data: any[]
  title: string
  description?: string
  type?: 'line' | 'area' | 'bar'
  dataKey: string
  xAxisKey?: string
  height?: number
  showTrend?: boolean
  color?: string
}

export function TrendChart({ 
  data, 
  title, 
  description, 
  type = 'line',
  dataKey, 
  xAxisKey = 'date',
  height = 300,
  showTrend = true,
  color = '#3B82F6'
}: TrendChartProps) {
  const calculateTrend = () => {
    if (!data || data.length < 2) return { direction: 'neutral', percentage: 0 }
    
    const firstValue = data[0][dataKey]
    const lastValue = data[data.length - 1][dataKey]
    
    if (firstValue === 0) return { direction: 'neutral', percentage: 0 }
    
    const percentage = ((lastValue - firstValue) / firstValue) * 100
    const direction = percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'neutral'
    
    return { direction, percentage: Math.abs(percentage) }
  }

  const trend = calculateTrend()

  const getTrendIcon = () => {
    switch (trend.direction) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />
      default: return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getTrendColor = () => {
    switch (trend.direction) {
      case 'up': return 'text-green-600'
      case 'down': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const renderChart = () => {
    if (!data || data.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <Calendar className="h-12 w-12 mx-auto mb-2" />
            <p>Aucune donnée de tendance disponible</p>
          </div>
        </div>
      )
    }

    const commonProps = {
      data,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    }

    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey={xAxisKey} 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  if (typeof value === 'string' && value.includes('-')) {
                    return new Date(value).toLocaleDateString('fr-FR', { 
                      month: 'short', 
                      day: 'numeric' 
                    })
                  }
                  return value
                }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value: any) => [value, 'Valeur']}
                labelFormatter={(label) => {
                  if (typeof label === 'string' && label.includes('-')) {
                    return new Date(label).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })
                  }
                  return `${xAxisKey}: ${label}`
                }}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey={dataKey} 
                stroke={color} 
                strokeWidth={3}
                dot={{ fill: color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey={xAxisKey} 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  if (typeof value === 'string' && value.includes('-')) {
                    return new Date(value).toLocaleDateString('fr-FR', { 
                      month: 'short', 
                      day: 'numeric' 
                    })
                  }
                  return value
                }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value: any) => [value, 'Valeur']}
                labelFormatter={(label) => {
                  if (typeof label === 'string' && label.includes('-')) {
                    return new Date(label).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })
                  }
                  return `${xAxisKey}: ${label}`
                }}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey={dataKey} 
                stroke={color} 
                fill={color}
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey={xAxisKey} 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  if (typeof value === 'string' && value.includes('-')) {
                    return new Date(value).toLocaleDateString('fr-FR', { 
                      month: 'short', 
                      day: 'numeric' 
                    })
                  }
                  return value
                }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value: any) => [value, 'Valeur']}
                labelFormatter={(label) => {
                  if (typeof label === 'string' && label.includes('-')) {
                    return new Date(label).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })
                  }
                  return `${xAxisKey}: ${label}`
                }}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar 
                dataKey={dataKey} 
                fill={color} 
                radius={[4, 4, 0, 0]}
                stroke={color}
                strokeWidth={1}
              />
            </BarChart>
          </ResponsiveContainer>
        )

      default:
        return null
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                {title}
              </CardTitle>
              {description && (
                <p className="text-sm text-gray-600 mt-1">{description}</p>
              )}
            </div>
          </div>
          
          {showTrend && trend.percentage > 0 && (
            <div className={`flex items-center gap-1 ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="text-sm font-medium">
                {trend.direction === 'up' ? '+' : trend.direction === 'down' ? '-' : ''}
                {trend.percentage.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  )
}























