'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Bell, 
  Send, 
  RefreshCw, 
  CheckCircle, 
  XCircle,
  Clock,
  AlertTriangle,
  Users,
  Zap
} from 'lucide-react'

interface ExpiringCustomer {
  id: string
  discordId: string
  discordUsername: string | null
  endDate: string
  daysLeft: number
  nitroType: string
}

interface Notification {
  id: string
  type: string
  message: string
  sentAt: string
  success: boolean
  error?: string
  customer: {
    discordUsername: string | null
    discordId: string
  }
}

interface Settings {
  isBotActive: boolean
  discordBotToken: string | null
  notificationChannelId: string | null
}

export function NotificationsTab() {
  const [expiringCustomers, setExpiringCustomers] = useState<ExpiringCustomer[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [statsRes, notificationsRes, settingsRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/notifications?limit=20'),
        fetch('/api/settings')
      ])

      const statsData = await statsRes.json()
      const notificationsData = await notificationsRes.json()
      const settingsData = await settingsRes.json()

      if (statsData.success) {
        setExpiringCustomers(statsData.data.expiringSoonList)
      }
      if (notificationsData.success) {
        setNotifications(notificationsData.data)
      }
      if (settingsData.success) {
        setSettings(settingsData.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendExpiringNotifications = async () => {
    if (!confirm('سيتم إرسال إشعارات لجميع العملاء القريبين من الانتهاء. هل تريد المتابعة؟')) return

    setSending(true)
    setMessage(null)

    try {
      const res = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_expiring_notifications' })
      })

      const data = await res.json()

      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: `تم إرسال ${data.data.sentCount} إشعار من أصل ${data.data.totalExpiring}` 
        })
        fetchData()
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'فشل في إرسال الإشعارات' })
    } finally {
      setSending(false)
    }
  }

  const markExpired = async () => {
    if (!confirm('سيتم تحديث حالة جميع الاشتراكات المنتهية. هل تريد المتابعة؟')) return

    try {
      const res = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_expired' })
      })

      const data = await res.json()

      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: `تم تحديث ${data.data.updatedCount} عميل` 
        })
        fetchData()
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'فشل في التحديث' })
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'EXPIRING_SOON':
        return <Badge className="bg-yellow-500/20 text-yellow-400">ينتهي قريباً</Badge>
      case 'EXPIRED':
        return <Badge className="bg-red-500/20 text-red-400">منتهي</Badge>
      case 'RENEWED':
        return <Badge className="bg-green-500/20 text-green-400">مجدّد</Badge>
      case 'MANUAL':
        return <Badge className="bg-blue-500/20 text-blue-400">يدوي</Badge>
      default:
        return <Badge className="bg-purple-500/20 text-purple-400">{type}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Message Alert */}
      {message && (
        <Alert className={message.type === 'success' ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}>
          {message.type === 'success' ? <CheckCircle className="h-4 w-4 text-green-400" /> : <XCircle className="h-4 w-4 text-red-400" />}
          <AlertDescription className={message.type === 'success' ? 'text-green-400' : 'text-red-400'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Bot Status Warning */}
      {settings && !settings.isBotActive && (
        <Alert className="bg-yellow-500/10 border-yellow-500/20">
          <AlertTriangle className="h-4 w-4 text-yellow-400" />
          <AlertTitle className="text-yellow-400">البوت غير مفعل</AlertTitle>
          <AlertDescription className="text-yellow-400/80">
            قم بتفعيل البوت من صفحة الإعدادات لإرسال الإشعارات
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Actions */}
      <Card className="bg-black/20 border-purple-500/20 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-400" />
            <CardTitle className="text-white">إجراءات سريعة</CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            إرسال وتحديث الإشعارات
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={sendExpiringNotifications}
              className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/20"
              disabled={sending || !settings?.isBotActive}
            >
              <Send className="w-4 h-4 ml-2" />
              إرسال إشعارات الانتهاء
            </Button>
            
            <Button
              onClick={markExpired}
              variant="outline"
              className="border-red-500/20 text-red-400 hover:bg-red-500/10"
            >
              <XCircle className="w-4 h-4 ml-2" />
              تحديث المنتهين
            </Button>
            
            <Button
              onClick={fetchData}
              variant="outline"
              className="border-purple-500/20 text-purple-400"
            >
              <RefreshCw className={`w-4 h-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
              تحديث البيانات
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Expiring Soon Customers */}
      <Card className="bg-black/20 border-purple-500/20 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <CardTitle className="text-white">العملاء القريبين من الانتهاء</CardTitle>
            </div>
            <Badge className="bg-yellow-500/20 text-yellow-400">
              {expiringCustomers.length} عميل
            </Badge>
          </div>
          <CardDescription className="text-gray-400">
            العملاء الذين سينتهي اشتراكهم خلال 7 أيام
          </CardDescription>
        </CardHeader>
        <CardContent>
          {expiringCustomers.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-400" />
              <p>لا يوجد عملاء قريبين من الانتهاء</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-purple-500/20 hover:bg-transparent">
                    <TableHead className="text-gray-300">العميل</TableHead>
                    <TableHead className="text-gray-300">النوع</TableHead>
                    <TableHead className="text-gray-300">تاريخ الانتهاء</TableHead>
                    <TableHead className="text-gray-300">متبقي</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expiringCustomers.map((customer) => (
                    <TableRow key={customer.id} className="border-purple-500/20 hover:bg-purple-500/5">
                      <TableCell>
                        <div>
                          <p className="text-white">{customer.discordUsername || 'بدون اسم'}</p>
                          <p className="text-xs text-gray-400">{customer.discordId}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-purple-500/20 text-purple-400">
                          {customer.nitroType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {new Date(customer.endDate).toLocaleDateString('ar-SA')}
                      </TableCell>
                      <TableCell>
                        <span className={`${customer.daysLeft <= 1 ? 'text-red-400' : customer.daysLeft <= 3 ? 'text-yellow-400' : 'text-orange-400'}`}>
                          {customer.daysLeft} يوم
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications History */}
      <Card className="bg-black/20 border-purple-500/20 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            <CardTitle className="text-white">سجل الإشعارات</CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            آخر 20 إشعار تم إرساله
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Bell className="w-12 h-12 mx-auto mb-4" />
              <p>لا توجد إشعارات</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-purple-500/20 hover:bg-transparent">
                    <TableHead className="text-gray-300">الحالة</TableHead>
                    <TableHead className="text-gray-300">النوع</TableHead>
                    <TableHead className="text-gray-300">العميل</TableHead>
                    <TableHead className="text-gray-300">الرسالة</TableHead>
                    <TableHead className="text-gray-300">التاريخ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map((notif) => (
                    <TableRow key={notif.id} className="border-purple-500/20 hover:bg-purple-500/5">
                      <TableCell>
                        {notif.success ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                      </TableCell>
                      <TableCell>{getTypeBadge(notif.type)}</TableCell>
                      <TableCell className="text-gray-300">
                        {notif.customer.discordUsername || notif.customer.discordId}
                      </TableCell>
                      <TableCell className="text-gray-300 max-w-[200px] truncate">
                        {notif.message}
                      </TableCell>
                      <TableCell className="text-gray-400 text-sm">
                        {new Date(notif.sentAt).toLocaleString('ar-SA')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
