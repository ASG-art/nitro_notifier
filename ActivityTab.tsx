'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Activity, 
  Clock,
  Filter
} from 'lucide-react'

interface ActivityLog {
  id: string
  action: string
  entityType: string
  entityId: string | null
  description: string
  userId: string | null
  createdAt: string
}

export function ActivityTab() {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [actionFilter, setActionFilter] = useState('ALL')
  const [entityFilter, setEntityFilter] = useState('ALL')

  useEffect(() => {
    fetchActivities()
  }, [actionFilter, entityFilter])

  const fetchActivities = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('limit', '100')
      if (actionFilter !== 'ALL') params.append('action', actionFilter)
      if (entityFilter !== 'ALL') params.append('entityType', entityFilter)

      const res = await fetch(`/api/activities?${params}`)
      const data = await res.json()
      
      if (data.success) {
        setActivities(data.data)
      }
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/20">إنشاء</Badge>
      case 'UPDATE':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/20">تحديث</Badge>
      case 'DELETE':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/20">حذف</Badge>
      case 'NOTIFY':
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/20">إشعار</Badge>
      default:
        return <Badge className="bg-gray-500/20 text-gray-400">{action}</Badge>
    }
  }

  const getEntityBadge = (entityType: string) => {
    switch (entityType) {
      case 'CUSTOMER':
        return <Badge variant="outline" className="border-purple-500/20 text-purple-400">عميل</Badge>
      case 'SETTINGS':
        return <Badge variant="outline" className="border-blue-500/20 text-blue-400">إعدادات</Badge>
      default:
        return <Badge variant="outline" className="border-gray-500/20 text-gray-400">{entityType}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('ar-SA'),
      time: date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="bg-black/20 border-purple-500/20 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-purple-400" />
            <CardTitle className="text-white">تصفية النشاطات</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[150px] bg-black/20 border-purple-500/20 text-white">
                <SelectValue placeholder="الإجراء" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-purple-500/20">
                <SelectItem value="ALL">كل الإجراءات</SelectItem>
                <SelectItem value="CREATE">إنشاء</SelectItem>
                <SelectItem value="UPDATE">تحديث</SelectItem>
                <SelectItem value="DELETE">حذف</SelectItem>
                <SelectItem value="NOTIFY">إشعار</SelectItem>
              </SelectContent>
            </Select>

            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-[150px] bg-black/20 border-purple-500/20 text-white">
                <SelectValue placeholder="النوع" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-purple-500/20">
                <SelectItem value="ALL">كل الأنواع</SelectItem>
                <SelectItem value="CUSTOMER">عميل</SelectItem>
                <SelectItem value="SETTINGS">إعدادات</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Activity Table */}
      <Card className="bg-black/20 border-purple-500/20 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            <CardTitle className="text-white">سجل النشاطات</CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            آخر 100 نشاط في النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Activity className="w-12 h-12 mx-auto mb-4" />
              <p>لا توجد نشاطات</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-purple-500/20 hover:bg-transparent">
                    <TableHead className="text-gray-300">الإجراء</TableHead>
                    <TableHead className="text-gray-300">النوع</TableHead>
                    <TableHead className="text-gray-300">الوصف</TableHead>
                    <TableHead className="text-gray-300">التاريخ</TableHead>
                    <TableHead className="text-gray-300">الوقت</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.map((activity) => {
                    const { date, time } = formatDate(activity.createdAt)
                    return (
                      <TableRow key={activity.id} className="border-purple-500/20 hover:bg-purple-500/5">
                        <TableCell>{getActionBadge(activity.action)}</TableCell>
                        <TableCell>{getEntityBadge(activity.entityType)}</TableCell>
                        <TableCell className="text-white">{activity.description}</TableCell>
                        <TableCell className="text-gray-400">{date}</TableCell>
                        <TableCell className="text-gray-400">{time}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-black/20 border-purple-500/20 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-400">
                {activities.filter(a => a.action === 'CREATE').length}
              </p>
              <p className="text-sm text-gray-400">إنشاء</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-black/20 border-purple-500/20 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-400">
                {activities.filter(a => a.action === 'UPDATE').length}
              </p>
              <p className="text-sm text-gray-400">تحديث</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-black/20 border-purple-500/20 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-400">
                {activities.filter(a => a.action === 'DELETE').length}
              </p>
              <p className="text-sm text-gray-400">حذف</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-black/20 border-purple-500/20 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-400">
                {activities.length}
              </p>
              <p className="text-sm text-gray-400">إجمالي</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
