import React, { useState, useEffect } from 'react'
import { 
  Package, 
  FolderTree, 
  ShoppingBag, 
  Key, 
  Trash2, 
  Plus, 
  RefreshCw, 
  LogOut, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react'

const API_BASE = 'http://localhost:5000/api/v1'

export default function App() {
  const [activeTab, setActiveTab] = useState('products')
  const [token, setToken] = useState(() => localStorage.getItem('admin_token') || '')
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('admin_user')
    return saved ? JSON.parse(saved) : null
  })

  // Feedback notifications
  const [alert, setAlert] = useState({ message: '', type: '' }) // type: 'success' | 'error'

  // Data states
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)

  // Auth Form State
  const [authForm, setAuthForm] = useState({ email: '', password: '' })
  
  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    image: ''
  })

  // New Category Form State
  const [newCategory, setNewCategory] = useState({ name: '', image: '' })

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type })
    setTimeout(() => setAlert({ message: '', type: '' }), 4000)
  }

  // Generic authenticated fetch helper
  const apiFetch = async (endpoint, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    }

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'API Request failed')
      }
      return data
    } catch (err) {
      showAlert(err.message, 'error')
      throw err
    }
  }

  // --- Auth Handlers ---
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await apiFetch('/users/login', {
        method: 'POST',
        body: JSON.stringify(authForm),
      })
      if (data.accessToken) {
        setToken(data.accessToken)
        setUser(data.data)
        localStorage.setItem('admin_token', data.accessToken)
        localStorage.setItem('admin_user', JSON.stringify(data.data))
        showAlert(`Welcome back, ${data.data.name}! (${data.data.role})`)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setToken('')
    setUser(null)
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    showAlert('Logged out successfully', 'success')
  }

  // --- Fetch Data ---
  const fetchProducts = async () => {
    setLoading(true)
    try {
      const data = await apiFetch('/products')
      setProducts(data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const data = await apiFetch('/categories')
      setCategories(data.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const fetchOrders = async () => {
    if (!token) return
    setLoading(true)
    try {
      const data = await apiFetch('/orders')
      setOrders(data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchProducts()
    fetchCategories()
    if (token) fetchOrders()
  }, [token])

  // --- Product Actions ---
  const handleCreateProduct = async (e) => {
    e.preventDefault()
    if (!newProduct.category) {
      return showAlert('Please select a category', 'error')
    }
    setLoading(true)
    try {
      await apiFetch('/products', {
        method: 'POST',
        body: JSON.stringify({
          ...newProduct,
          price: Number(newProduct.price),
          stock: Number(newProduct.stock),
          image: newProduct.image ? [newProduct.image] : [],
        }),
      })
      showAlert('Product created successfully!')
      setNewProduct({ title: '', description: '', price: '', stock: '', category: '', image: '' })
      fetchProducts()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
      await apiFetch(`/products/${id}`, { method: 'DELETE' })
      showAlert('Product deleted')
      fetchProducts()
    } catch (err) {
      console.error(err)
    }
  }

  // --- Category Actions ---
  const handleCreateCategory = async (e) => {
    e.preventDefault()
    if (!newCategory.name) return
    setLoading(true)
    try {
      await apiFetch('/categories', {
        method: 'POST',
        body: JSON.stringify(newCategory),
      })
      showAlert('Category created successfully!')
      setNewCategory({ name: '', image: '' })
      fetchCategories()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCategory = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return
    try {
      await apiFetch(`/categories/${id}`, { method: 'DELETE' })
      showAlert('Category deleted')
      fetchCategories()
    } catch (err) {
      console.error(err)
    }
  }

  // --- Order Actions ---
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await apiFetch(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      })
      showAlert(`Order updated to ${newStatus}`)
      fetchOrders()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
              C
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">CartNest Admin</h1>
              <p className="text-xs text-gray-500">Backend Control Panel</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {token ? (
              <div className="flex items-center gap-2 text-sm bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="font-medium">{user?.name || 'Admin'}</span>
                <span className="text-xs text-gray-500 capitalize">({user?.role || 'authorized'})</span>
                <button
                  onClick={handleLogout}
                  className="ml-2 text-gray-500 hover:text-red-600 flex items-center gap-1 text-xs cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                <span>Not logged in (Protected APIs will require token)</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 flex gap-2 border-t border-gray-100">
          {[
            { id: 'products', label: 'Products', icon: Package, count: products.length },
            { id: 'categories', label: 'Categories', icon: FolderTree, count: categories.length },
            { id: 'orders', label: 'Orders', icon: ShoppingBag, count: orders.length },
            { id: 'auth', label: 'Auth & Config', icon: Key },
          ].map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                  active
                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="text-xs bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </header>

      {/* Global Alert Notification */}
      {alert.message && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div
            className={`p-3 rounded-lg border text-sm flex items-center gap-2 ${
              alert.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-green-50 border-green-200 text-green-700'
            }`}
          >
            {alert.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{alert.message}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* ================= PRODUCTS TAB ================= */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Add Product Form */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
              <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-600" />
                Create New Product
              </h2>

              <form onSubmit={handleCreateProduct} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Wireless Noise Canceling Headphones"
                    value={newProduct.title}
                    onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="99.99"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Stock Count *</label>
                  <input
                    type="number"
                    required
                    placeholder="50"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    required
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden bg-white"
                  >
                    <option value="">Select a Category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={newProduct.image}
                    onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    required
                    rows="2"
                    placeholder="Write a clear product description..."
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div className="md:col-span-3 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2 rounded-md transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Save Product'}
                  </button>
                </div>
              </form>
            </div>

            {/* Products Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-xs">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">
                  All Products ({products.length})
                </h3>
                <button
                  onClick={fetchProducts}
                  className="cursor-pointer text-xs text-gray-600 hover:text-indigo-600 flex items-center gap-1 font-medium"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Refresh
                </button>
              </div>

              {products.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-500">
                  No products found. Add your first product above!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600 text-xs uppercase border-b border-gray-200">
                      <tr>
                        <th className="py-3 px-4">Product</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Price</th>
                        <th className="py-3 px-4">Stock</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {products.map((p) => (
                        <tr key={p._id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 flex items-center gap-3">
                            <img
                              src={p.image?.[0] || 'https://placehold.co/80x80?text=Item'}
                              alt={p.title}
                              className="w-10 h-10 object-cover rounded-md border border-gray-200 bg-gray-100 shrink-0"
                            />
                            <div>
                              <div className="font-medium text-gray-900 line-clamp-1">{p.title}</div>
                              <div className="text-xs text-gray-500 line-clamp-1">{p.description}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {p.category?.name || 'Uncategorized'}
                          </td>
                          <td className="py-3 px-4 font-semibold text-gray-900">
                            ${Number(p.price).toFixed(2)}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                p.stock > 10
                                  ? 'bg-green-100 text-green-700'
                                  : p.stock > 0
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {p.stock} in stock
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleDeleteProduct(p._id)}
                              className="cursor-pointer text-gray-400 hover:text-red-600 p-1.5 rounded-md hover:bg-gray-100"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= CATEGORIES TAB ================= */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            {/* Add Category Form */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
              <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-600" />
                Add New Category
              </h2>

              <form onSubmit={handleCreateCategory} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  required
                  placeholder="Category Name (e.g. Electronics, Footwear)"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="flex-1 text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                />
                <input
                  type="url"
                  placeholder="Optional Image URL"
                  value={newCategory.image}
                  onChange={(e) => setNewCategory({ ...newCategory, image: e.target.value })}
                  className="flex-1 text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2 rounded-md transition-colors disabled:opacity-50"
                >
                  Save Category
                </button>
              </form>
            </div>

            {/* Categories List */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-xs">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">
                  Categories ({categories.length})
                </h3>
                <button
                  onClick={fetchCategories}
                  className="cursor-pointer text-xs text-gray-600 hover:text-indigo-600 flex items-center gap-1 font-medium"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Refresh
                </button>
              </div>

              {categories.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-500">
                  No categories found. Create your first category above!
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {categories.map((c) => (
                    <div
                      key={c._id}
                      className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {c.image ? (
                          <img
                            src={c.image}
                            alt={c.name}
                            className="w-10 h-10 object-cover rounded-md border border-gray-200"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-md flex items-center justify-center font-bold">
                            {c.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{c.name}</h4>
                          <p className="text-xs text-gray-400 font-mono">ID: {c._id}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteCategory(c._id)}
                        className="cursor-pointer text-gray-400 hover:text-red-600 p-1.5 rounded-md hover:bg-gray-100"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= ORDERS TAB ================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-xs">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">
                  Customer Orders ({orders.length})
                </h3>
                <button
                  onClick={fetchOrders}
                  className="cursor-pointer text-xs text-gray-600 hover:text-indigo-600 flex items-center gap-1 font-medium"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Refresh
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-500">
                  {token
                    ? 'No orders placed yet in the database.'
                    : 'Please log in under the "Auth & Config" tab to view orders.'}
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {orders.map((o) => (
                    <div key={o._id} className="p-4 hover:bg-gray-50 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 text-sm">
                              Order #{o._id.slice(-6).toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(o.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            Customer: <span className="font-medium">{o.user?.name || 'Guest'}</span> ({o.user?.email || 'N/A'})
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            Address: {o.address}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-sm font-bold text-gray-900">
                              ${Number(o.totalAmount || 0).toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500 capitalize">
                              {o.paymentMethod || 'COD'}
                            </div>
                          </div>

                          {/* Status Selector */}
                          <select
                            value={o.status || 'pending'}
                            onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)}
                            className={`text-xs font-semibold px-2.5 py-1.5 rounded-md border cursor-pointer ${
                              o.status === 'delivered'
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : o.status === 'shipped'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : o.status === 'processing'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : o.status === 'cancelled'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-gray-50 text-gray-700 border-gray-300'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>

                      {/* Item list */}
                      <div className="bg-gray-50 p-2.5 rounded-md border border-gray-100 flex flex-wrap gap-2 text-xs text-gray-600">
                        {o.products?.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-gray-200">
                            <span>{item.title}</span>
                            <span className="font-semibold text-gray-800">x{item.quantity}</span>
                            <span className="text-gray-500">(${item.price})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= AUTH & CONFIG TAB ================= */}
        {activeTab === 'auth' && (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-xs">
              <h2 className="text-base font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-600" />
                Admin Authentication
              </h2>
              <p className="text-xs text-gray-500 mb-4">
                Login with seller/admin credentials to authorize requests to protected backend routes.
              </p>

              <form onSubmit={handleLogin} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="admin@cartnest.com"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded-md transition-colors disabled:opacity-50"
                >
                  {loading ? 'Logging in...' : 'Sign In to Admin'}
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Or Paste JWT Token Directly
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={token}
                    onChange={(e) => {
                      setToken(e.target.value)
                      localStorage.setItem('admin_token', e.target.value)
                    }}
                    className="flex-1 font-mono text-xs border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                  />
                  {token && (
                    <button
                      onClick={handleLogout}
                      className="cursor-pointer text-xs border border-gray-300 px-3 py-2 rounded-md hover:bg-gray-50 text-red-600 font-medium"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Status Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-xs space-y-2 text-gray-600">
              <div className="font-semibold text-gray-900">Backend API Endpoint:</div>
              <code className="bg-gray-100 p-1.5 rounded block text-indigo-700 font-mono">
                {API_BASE}
              </code>
              <div className="flex justify-between pt-2 border-t border-gray-100">
                <span>Status:</span>
                <span className="font-medium text-green-600">Connected</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
