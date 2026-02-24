'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  RefreshCw, 
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  User
} from 'lucide-react'

interface Customer {
  id: string
  discordId: string
  discordUsername: string | null
  discordAvatar: string | null
  nitroType: string
  startDate: string
  endDate: string
  durationMonths: number
  price: number | null
  notes: string | null
  status: string
  daysLeft: number
  isExpiringSoon: boolean
  isExpired: boolean
  notifications: Array<{
    id: string
    type: string
    sentAt: string
  }>
}

export function CustomersTab() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [formData, setFormData] = useState({
    discordId: '',
    discordUsername: '',
    nitroType: 'CLASSIC',
    startDate: new Date().toISOString().split('T')[0],
    durationMonths: '1',
    price: '',
    notes: ''
  })

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'ALL') params.append('status', statusFilter)
      if (search) params.append('search', search)

      const res = await fetch(`/api/customers?${params}`)
      const data = await res.json()
      
      if (data.success) {
        setCustomers(data.data)
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [statusFilter, search])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingCustomer ? '/api/customers' : '/api/customers'
      const method = editingCustomer ? 'PUT' : 'POST'
      
      const body = editingCustomer 
        ? { id: editingCustomer.id, ...formData }
        : formData

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await res.json()
      
      if (data.success) {
        setDialogOpen(false)
        setEditingCustomer(null)
        setFormData({
          discordId: '',
          discordUsername: '',
          nitroType: 'CLASSIC',
          startDate: new Date().toISOString().split('T')[0],
          durationMonths: '1',
          price: '',
          notes: ''
        })
        fetchCustomers()
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error('Error saving customer:', error)
      alert('حدث خطأ في الحفظ')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العميل؟')) return

    try {
      const res = await fetch(`/api/customers?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      
      if (data.success) {
        fetchCustomers()
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error('Error deleting customer:', error)
    }
  }

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    setFormData({
      discordId: customer.discordId,
      discordUsername: customer.discordUsername || '',
      nitroType: customer.nitroType,
      startDate: new Date(customer.startDate).toISOString().split('T')[0],
      durationMonths: customer.durationMonths.toString(),
      price: customer.price?.toString() || '',
      notes: customer.notes || ''
    })
    setDialogOpen(true)
  }

  const exportCustomers = () => {
    const csv = [
      ['Discord ID', 'Username', 'Nitro Type', 'Start Date', 'End Date', 'Days Left', 'Status', 'Price', 'Notes'].join(','),
      ...customers.map(c => [
        c.discordId,
        c.discordUsername || '',
        c.nitroType,
        new Date(c.startDate).toLocaleDateString(),
        new Date(c.endDate).toLocaleDateString(),
        c.daysLeft,
        c.status,
        c.price || '',
        c.notes || ''
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `customers_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const getStatusBadge = (customer: Customer) => {
    if (customer.isExpired || customer.status === 'EXPIRED') {
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/20">منتهي</Badge>
    }
    if (customer.isExpiringSoon) {
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/20">ينتهي قريباً</Badge>
    }
    return <Badge className="bg-green-500/20 text-green-400 border-green-500/20">نشط</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="bg-black/20 border-purple-500/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">إدارة العملاء</CardTitle>
          <CardDescription className="text-gray-400">إضافة وتعديل وحذف العملاء</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="بحث..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-black/20 border-purple-500/20 text-white pr-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] bg-black/20 border-purple-500/20 text-white">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-purple-500/20">
                <SelectItem value="ALL">الكل</SelectItem>
                <SelectItem value="ACTIVE">نشط</SelectItem>
                <SelectItem value="EXPIRED">منتهي</SelectItem>
                <SelectItem value="CANCELLED">ملغي</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              onClick={fetchCustomers}
              variant="outline"
              className="border-purple-500/20 text-purple-400"
            >
              <RefreshCw className={`w-4 h-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
              تحديث
            </Button>

            <Button 
              onClick={exportCustomers}
              variant="outline"
              className="border-green-500/20 text-green-400"
            >
              <Download className="w-4 h-4 ml-2" />
              تصدير
            </Button>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-purple-500 hover:bg-purple-600"
                  onClick={() => {
                    setEditingCustomer(null)
                    setFormData({
                      discordId: '',
                      discordUsername: '',
                      nitroType: 'CLASSIC',
                      startDate: new Date().toISOString().split('T')[0],
                      durationMonths: '1',
                      price: '',
                      notes: ''
                    })
                  }}
                >
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة عميل
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-purple-500/20 text-white max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingCustomer ? 'تعديل عميل' : 'إضافة عميل جديد'}</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    أدخل بيانات العميل
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="discordId">معرف ديسكورد *</Label>
                    <Input
                      id="discordId"
                      value={formData.discordId}
                      onChange={(e) => setFormData({...formData, discordId: e.target.value})}
                      placeholder="123456789012345678"
                      required
                      className="bg-black/20 border-purple-500/20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="discordUsername">اسم المستخدم</Label>
                    <Input
                      id="discordUsername"
                      value={formData.discordUsername}
                      onChange={(e) => setFormData({...formData, discordUsername: e.target.value})}
                      placeholder="Username#0000"
                      className="bg-black/20 border-purple-500/20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="nitroType">نوع النيترو</Label>
                    <Select value={formData.nitroType} onValueChange={(v) => setFormData({...formData, nitroType: v})}>
                      <SelectTrigger className="bg-black/20 border-purple-500/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-purple-500/20">
                        <SelectItem value="CLASSIC">Classic</SelectItem>
                        <SelectItem value="BASIC">Basic</SelectItem>
                        <SelectItem value="PREMIUM">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">تاريخ البداية</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                        className="bg-black/20 border-purple-500/20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="durationMonths">المدة (أشهر)</Label>
                      <Select value={formData.durationMonths} onValueChange={(v) => setFormData({...formData, durationMonths: v})}>
                        <SelectTrigger className="bg-black/20 border-purple-500/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-purple-500/20">
                          <SelectItem value="1">شهر واحد</SelectItem>
                          <SelectItem value="2">شهرين</SelectItem>
                          <SelectItem value="3">3 أشهر</SelectItem>
                          <SelectItem value="6">6 أشهر</SelectItem>
                          <SelectItem value="12">سنة</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="price">السعر ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      placeholder="9.99"
                      className="bg-black/20 border-purple-500/20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">ملاحظات</Label>
                    <Input
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="ملاحظات إضافية..."
                      className="bg-black/20 border-purple-500/20"
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="bg-purple-500 hover:bg-purple-600 w-full">
                      {editingCustomer ? 'حفظ التعديلات' : 'إضافة العميل'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Expiring Soon Alert */}
      {customers.filter(c => c.isExpiringSoon).length > 0 && (
        <Alert className="bg-yellow-500/10 border-yellow-500/20">
          <AlertTriangle className="h-4 w-4 text-yellow-400" />
          <AlertDescription className="text-yellow-400">
            يوجد {customers.filter(c => c.isExpiringSoon).length} عميل سينتهي اشتراكه خلال 7 أيام!
          </AlertDescription>
        </Alert>
      )}

      {/* Customers Table */}
      <Card className="bg-black/20 border-purple-500/20 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-purple-500/20 hover:bg-transparent">
                  <TableHead className="text-gray-300">العميل</TableHead>
                  <TableHead className="text-gray-300">النوع</TableHead>
                  <TableHead className="text-gray-300">البداية</TableHead>
                  <TableHead className="text-gray-300">النهاية</TableHead>
                  <TableHead className="text-gray-300">متبقي</TableHead>
                  <TableHead className="text-gray-300">الحالة</TableHead>
                  <TableHead className="text-gray-300">السعر</TableHead>
                  <TableHead className="text-gray-300">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-400 py-8">
                      جاري التحميل...
                    </TableCell>
                  </TableRow>
                ) : customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-400 py-8">
                      لا يوجد عملاء
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map((customer) => (
                    <TableRow key={customer.id} className="border-purple-500/20 hover:bg-purple-500/5">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-purple-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{customer.discordUsername || 'بدون اسم'}</p>
                            <p className="text-xs text-gray-400">{customer.discordId}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-purple-500/20 text-purple-400">
                          {customer.nitroType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {new Date(customer.startDate).toLocaleDateString('ar-SA')}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {new Date(customer.endDate).toLocaleDateString('ar-SA')}
                      </TableCell>
                      <TableCell>
                        <span className={`${customer.daysLeft <= 3 ? 'text-red-400' : customer.daysLeft <= 7 ? 'text-yellow-400' : 'text-green-400'}`}>
                          {customer.daysLeft} يوم
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(customer)}</TableCell>
                      <TableCell className="text-gray-300">
                        {customer.price ? `$${customer.price}` : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-blue-400 hover:text-blue-300"
                            onClick={() => handleEdit(customer)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:text-red-300"
                            onClick={() => handleDelete(customer.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
