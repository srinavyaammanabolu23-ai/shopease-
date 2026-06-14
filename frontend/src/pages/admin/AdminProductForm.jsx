import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { HiArrowLeft, HiPlus, HiTrash, HiPhoto, HiCheckCircle } from 'react-icons/hi2'
import {
  useGetProductQuery, useCreateProductMutation,
  useUpdateProductMutation, useGetCategoriesQuery
} from '../../services/api'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const emptyForm = {
  name: '', slug: '', brand: '', category: '', price: '', discount: 0,
  stock: '', sku: '', shortDescription: '', description: '',
  isFeatured: false, isNewArrival: true, isBestSeller: false, isActive: true,
  images: [], specifications: [], tags: ''
}

export default function AdminProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const { data: productData, isLoading: loadingProduct } = useGetProductQuery(id, { skip: !isEdit })
  const { data: categoriesData } = useGetCategoriesQuery({ flat: true })
  const [createProduct, { isLoading: creating }] = useCreateProductMutation()
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation()

  const [form, setForm] = useState(emptyForm)
  const [newSpec, setNewSpec] = useState({ key: '', value: '' })
  const [newImageUrl, setNewImageUrl] = useState('')

  const categories = categoriesData?.categories || []
  const saving = creating || updating

  useEffect(() => {
    if (isEdit && productData?.product) {
      const p = productData.product
      setForm({
        name: p.name || '', slug: p.slug || '', brand: p.brand || '',
        category: p.category?._id || p.category || '',
        price: p.price || '', discount: p.discount || 0, stock: p.stock || '',
        sku: p.sku || '', shortDescription: p.shortDescription || '',
        description: p.description || '', isFeatured: p.isFeatured || false,
        isNewArrival: p.isNewArrival || false, isBestSeller: p.isBestSeller || false,
        isActive: p.isActive !== false,
        images: p.images || [], specifications: p.specifications || [],
        tags: (p.tags || []).join(', ')
      })
    }
  }, [isEdit, productData])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      price: Number(form.price),
      discount: Number(form.discount),
      stock: Number(form.stock),
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    }
    try {
      if (isEdit) { await updateProduct({ id, ...payload }).unwrap(); toast.success('Product updated!') }
      else { await createProduct(payload).unwrap(); toast.success('Product created!') }
      navigate('/admin/products')
    } catch (err) { toast.error(err?.data?.message || 'Something went wrong') }
  }

  const addImage = () => {
    if (!newImageUrl.trim()) return
    set('images', [...form.images, { url: newImageUrl.trim(), alt: form.name }])
    setNewImageUrl('')
  }
  const removeImage = (i) => set('images', form.images.filter((_, idx) => idx !== i))
  const addSpec = () => {
    if (!newSpec.key || !newSpec.value) return
    set('specifications', [...form.specifications, { ...newSpec }])
    setNewSpec({ key: '', value: '' })
  }
  const removeSpec = (i) => set('specifications', form.specifications.filter((_, idx) => idx !== i))

  const effectivePrice = form.price && form.discount ? form.price - (form.price * form.discount / 100) : form.price

  if (isEdit && loadingProduct) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>

  return (
    <>
      <Helmet><title>{isEdit ? 'Edit Product' : 'Add Product'} - ShopEase Admin</title></Helmet>

      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/admin/products')} className="btn-ghost btn-icon"><HiArrowLeft className="w-5 h-5" /></button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{isEdit ? 'Update product information' : 'Fill in the details to add a new product'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        {/* Main fields */}
        <div className="lg:col-span-2 space-y-5">
          {/* Basic Info */}
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Basic Information</h2>
            <div>
              <label className="label">Product Name *</label>
              <input value={form.name} onChange={e => { set('name', e.target.value); if (!isEdit) set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')) }} required className="input" placeholder="e.g. Samsung Galaxy M34" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Slug</label>
                <input value={form.slug} onChange={e => set('slug', e.target.value)} className="input font-mono text-sm" />
              </div>
              <div>
                <label className="label">Brand</label>
                <input value={form.brand} onChange={e => set('brand', e.target.value)} className="input" placeholder="e.g. Samsung" />
              </div>
            </div>
            <div>
              <label className="label">Category *</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} required className="input">
                <option value="">Select category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Short Description</label>
              <textarea value={form.shortDescription} onChange={e => set('shortDescription', e.target.value)} className="input resize-none h-20" placeholder="Brief product summary (shown in listing cards)" />
            </div>
            <div>
              <label className="label">Full Description *</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} required className="input resize-none h-36" placeholder="Detailed product description..." />
            </div>
            <div>
              <label className="label">Tags</label>
              <input value={form.tags} onChange={e => set('tags', e.target.value)} className="input" placeholder="smartphone, android, 5g (comma separated)" />
            </div>
          </div>

          {/* Pricing */}
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Pricing & Inventory</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="label">Price (₹) *</label>
                <input type="number" value={form.price} onChange={e => set('price', e.target.value)} required min="0" className="input" placeholder="999" />
              </div>
              <div>
                <label className="label">Discount (%)</label>
                <input type="number" value={form.discount} onChange={e => set('discount', e.target.value)} min="0" max="90" className="input" placeholder="0" />
              </div>
              <div>
                <label className="label">Stock *</label>
                <input type="number" value={form.stock} onChange={e => set('stock', e.target.value)} required min="0" className="input" placeholder="100" />
              </div>
              <div>
                <label className="label">SKU</label>
                <input value={form.sku} onChange={e => set('sku', e.target.value)} className="input font-mono text-sm" placeholder="SKU-001" />
              </div>
            </div>
            {form.price && form.discount > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3">
                <p className="text-sm text-green-700 dark:text-green-300">
                  Effective price: <strong>₹{Math.round(effectivePrice).toLocaleString('en-IN')}</strong>
                  <span className="ml-2 text-green-500">({form.discount}% off ₹{Math.round(form.price).toLocaleString('en-IN')})</span>
                </p>
              </div>
            )}
          </div>

          {/* Images */}
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Product Images</h2>
            <div className="flex gap-3">
              <input value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} placeholder="Paste image URL..." className="input flex-1" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addImage())} />
              <button type="button" onClick={addImage} className="btn-primary shrink-0"><HiPlus className="w-4 h-4" /> Add</button>
            </div>
            {form.images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {form.images.map((img, i) => (
                  <div key={i} className="relative group">
                    <img src={img.url} alt={img.alt || 'Product'} className="w-full aspect-square object-cover rounded-xl bg-gray-100" onError={e => { e.target.src = 'https://via.placeholder.com/100' }} />
                    <button type="button" onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <HiTrash className="w-3 h-3" />
                    </button>
                    {i === 0 && <span className="absolute bottom-1 left-1 bg-primary-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">Main</span>}
                  </div>
                ))}
              </div>
            )}
            {form.images.length === 0 && (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center text-gray-400">
                <HiPhoto className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Add image URLs above</p>
              </div>
            )}
          </div>

          {/* Specifications */}
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Specifications</h2>
            <div className="flex gap-3">
              <input value={newSpec.key} onChange={e => setNewSpec(s => ({ ...s, key: e.target.value }))} placeholder="Key (e.g. RAM)" className="input flex-1" />
              <input value={newSpec.value} onChange={e => setNewSpec(s => ({ ...s, value: e.target.value }))} placeholder="Value (e.g. 8GB)" className="input flex-1" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSpec())} />
              <button type="button" onClick={addSpec} className="btn-primary shrink-0"><HiPlus className="w-4 h-4" /></button>
            </div>
            {form.specifications.length > 0 && (
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {form.specifications.map((spec, i) => (
                    <tr key={i}>
                      <td className="py-2 font-medium text-gray-900 dark:text-white w-1/3">{spec.key}</td>
                      <td className="py-2 text-gray-600 dark:text-gray-400">{spec.value}</td>
                      <td className="py-2 text-right"><button type="button" onClick={() => removeSpec(i)} className="text-red-400 hover:text-red-600"><HiTrash className="w-3.5 h-3.5" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Status & Flags */}
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Product Status</h2>
            {[
              { key: 'isActive', label: 'Active', desc: 'Visible in store' },
              { key: 'isFeatured', label: 'Featured', desc: 'Show in featured section' },
              { key: 'isNewArrival', label: 'New Arrival', desc: 'Show in new arrivals' },
              { key: 'isBestSeller', label: 'Best Seller', desc: 'Show in best sellers' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
                <button type="button" onClick={() => set(key, !form[key])}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form[key] ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form[key] ? 'translate-x-5' : ''}`} />
                </button>
              </div>
            ))}
          </div>

          {/* Preview */}
          {form.images[0] && (
            <div className="card p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Image Preview</p>
              <img src={form.images[0]?.url} alt="Preview" className="w-full aspect-square object-contain rounded-xl bg-gray-50 dark:bg-gray-800" />
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={saving} className="btn-primary w-full py-3 justify-center text-base">
            {saving ? <LoadingSpinner size="sm" color="white" /> : <><HiCheckCircle className="w-5 h-5" />{isEdit ? 'Update Product' : 'Create Product'}</>}
          </button>
          <button type="button" onClick={() => navigate('/admin/products')} className="btn-secondary w-full justify-center">
            Cancel
          </button>
        </div>
      </form>
    </>
  )
}
