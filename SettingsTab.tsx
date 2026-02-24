'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { 
  Settings, 
  Save, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Bot,
  Server,
  Bell,
  Shield
} from 'lucide-react'

interface Settings {
  id: string
  discordBotToken: string | null
  discordClientId: string | null
  discordGuildId: string | null
  notificationChannelId: string | null
  nitroRoleId: string | null
  adminRoleId: string | null
  notifyBeforeDays: number
  notifyBeforeHours: number
  isBotActive: boolean
}

export function SettingsTab() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [botInfo, setBotInfo] = useState<{ botId: string; botUsername: string } | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  const [formData, setFormData] = useState({
    discordBotToken: '',
    discordClientId: '',
    discordGuildId: '',
    notificationChannelId: '',
    nitroRoleId: '',
    adminRoleId: '',
    notifyBeforeDays: 7,
    notifyBeforeHours: 24,
    isBotActive: false
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      
      if (data.success) {
        setSettings(data.data)
        setFormData({
          discordBotToken: '', // لا نعيد التوكن المحمي
          discordClientId: data.data.discordClientId || '',
          discordGuildId: data.data.discordGuildId || '',
          notificationChannelId: data.data.notificationChannelId || '',
          nitroRoleId: data.data.nitroRoleId || '',
          adminRoleId: data.data.adminRoleId || '',
          notifyBeforeDays: data.data.notifyBeforeDays,
          notifyBeforeHours: data.data.notifyBeforeHours,
          isBotActive: data.data.isBotActive
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const verifyToken = async () => {
    if (!formData.discordBotToken) {
      setMessage({ type: 'error', text: 'أدخل التوكن أولاً' })
      return
    }

    setVerifying(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discordBotToken: formData.discordBotToken })
      })
      
      const data = await res.json()
      
      if (data.success) {
        setBotInfo(data.data)
        setMessage({ type: 'success', text: 'التوكن صالح!' })
      } else {
        setBotInfo(null)
        setMessage({ type: 'error', text: data.error })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'فشل في التحقق' })
    } finally {
      setVerifying(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await res.json()
      
      if (data.success) {
        setMessage({ type: 'success', text: 'تم حفظ الإعدادات بنجاح!' })
        fetchSettings()
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'فشل في حفظ الإعدادات' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
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

      {/* Bot Settings */}
      <Card className="bg-black/20 border-purple-500/20 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-400" />
            <CardTitle className="text-white">إعدادات البوت</CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            إعدادات التواصل مع بوت ديسكورد
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="botToken" className="text-gray-300">توكن البوت</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="botToken"
                    type="password"
                    value={formData.discordBotToken}
                    onChange={(e) => setFormData({...formData, discordBotToken: e.target.value})}
                    placeholder="OTIzNjQwNjY..."
                    className="bg-black/20 border-purple-500/20 text-white"
                  />
                  <Button 
                    onClick={verifyToken}
                    variant="outline"
                    className="border-purple-500/20 text-purple-400"
                    disabled={verifying}
                  >
                    {verifying ? '...' : 'تحقق'}
                  </Button>
                </div>
                {settings?.discordBotToken && !formData.discordBotToken && (
                  <p className="text-xs text-gray-400 mt-1">التوكن محفوظ ••••••••</p>
                )}
                {botInfo && (
                  <p className="text-xs text-green-400 mt-1">
                    {botInfo.botUsername} ({botInfo.botId})
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="clientId" className="text-gray-300">معرف التطبيق (Client ID)</Label>
                <Input
                  id="clientId"
                  value={formData.discordClientId}
                  onChange={(e) => setFormData({...formData, discordClientId: e.target.value})}
                  placeholder="123456789012345678"
                  className="bg-black/20 border-purple-500/20 text-white mt-1"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="guildId" className="text-gray-300">معرف السيرفر (Guild ID)</Label>
                <Input
                  id="guildId"
                  value={formData.discordGuildId}
                  onChange={(e) => setFormData({...formData, discordGuildId: e.target.value})}
                  placeholder="123456789012345678"
                  className="bg-black/20 border-purple-500/20 text-white mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="channelId" className="text-gray-300">قناة الإشعارات (Channel ID)</Label>
                <Input
                  id="channelId"
                  value={formData.notificationChannelId}
                  onChange={(e) => setFormData({...formData, notificationChannelId: e.target.value})}
                  placeholder="123456789012345678"
                  className="bg-black/20 border-purple-500/20 text-white mt-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roles Settings */}
      <Card className="bg-black/20 border-purple-500/20 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-400" />
            <CardTitle className="text-white">إعدادات الرتب</CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            الرتب المستخدمة في النظام
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="nitroRole" className="text-gray-300">معرف رتبة النيترو</Label>
              <Input
                id="nitroRole"
                value={formData.nitroRoleId}
                onChange={(e) => setFormData({...formData, nitroRoleId: e.target.value})}
                placeholder="123456789012345678"
                className="bg-black/20 border-purple-500/20 text-white mt-1"
              />
              <p className="text-xs text-gray-400 mt-1">الرتبة التي تُعطى للأعضاء المشتركين</p>
            </div>
            
            <div>
              <Label htmlFor="adminRole" className="text-gray-300">معرف رتبة الأدمن</Label>
              <Input
                id="adminRole"
                value={formData.adminRoleId}
                onChange={(e) => setFormData({...formData, adminRoleId: e.target.value})}
                placeholder="123456789012345678"
                className="bg-black/20 border-purple-500/20 text-white mt-1"
              />
              <p className="text-xs text-gray-400 mt-1">الرتبة المسموح لها بالتحكم</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="bg-black/20 border-purple-500/20 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-400" />
            <CardTitle className="text-white">إعدادات الإشعارات</CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            توقيت وتكرار الإشعارات
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="notifyDays" className="text-gray-300">الإشعار قبل (أيام)</Label>
              <Input
                id="notifyDays"
                type="number"
                min="1"
                max="30"
                value={formData.notifyBeforeDays}
                onChange={(e) => setFormData({...formData, notifyBeforeDays: parseInt(e.target.value) || 7})}
                className="bg-black/20 border-purple-500/20 text-white mt-1"
              />
              <p className="text-xs text-gray-400 mt-1">عدد الأيام قبل انتهاء الاشتراك للإشعار</p>
            </div>
            
            <div>
              <Label htmlFor="notifyHours" className="text-gray-300">الإشعار قبل (ساعات)</Label>
              <Input
                id="notifyHours"
                type="number"
                min="1"
                max="72"
                value={formData.notifyBeforeHours}
                onChange={(e) => setFormData({...formData, notifyBeforeHours: parseInt(e.target.value) || 24})}
                className="bg-black/20 border-purple-500/20 text-white mt-1"
              />
              <p className="text-xs text-gray-400 mt-1">عدد الساعات قبل انتهاء الاشتراك</p>
            </div>
          </div>

          <Separator className="bg-purple-500/20" />

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">تفعيل البوت</Label>
              <p className="text-sm text-gray-400">تشغيل/إيقاف البوت</p>
            </div>
            <Switch
              checked={formData.isBotActive}
              onCheckedChange={(checked) => setFormData({...formData, isBotActive: checked})}
            />
          </div>
        </CardContent>
      </Card>

      {/* Bot Status */}
      <Card className="bg-black/20 border-purple-500/20 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-purple-400" />
            <CardTitle className="text-white">حالة البوت</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-black/20 border border-purple-500/10">
              <div className="flex items-center gap-2 mb-2">
                {settings?.discordBotToken ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400" />
                )}
                <span className="text-gray-300">التوكن</span>
              </div>
              <p className="text-sm text-gray-400">
                {settings?.discordBotToken ? 'تم الإعداد' : 'لم يتم الإعداد'}
              </p>
            </div>
            
            <div className="p-4 rounded-lg bg-black/20 border border-purple-500/10">
              <div className="flex items-center gap-2 mb-2">
                {settings?.discordGuildId ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400" />
                )}
                <span className="text-gray-300">السيرفر</span>
              </div>
              <p className="text-sm text-gray-400">
                {settings?.discordGuildId ? 'تم الربط' : 'لم يتم الربط'}
              </p>
            </div>
            
            <div className="p-4 rounded-lg bg-black/20 border border-purple-500/10">
              <div className="flex items-center gap-2 mb-2">
                {settings?.isBotActive ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                )}
                <span className="text-gray-300">الحالة</span>
              </div>
              <Badge className={settings?.isBotActive ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
                {settings?.isBotActive ? 'نشط' : 'متوقف'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <Button
          onClick={fetchSettings}
          variant="outline"
          className="border-purple-500/20 text-purple-400"
        >
          إعادة تحميل
        </Button>
        <Button
          onClick={handleSave}
          className="bg-purple-500 hover:bg-purple-600"
          disabled={saving}
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
              جاري الحفظ...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 ml-2" />
              حفظ الإعدادات
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
