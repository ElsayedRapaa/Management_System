import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { formatCurrency, generateCode } from '../lib/formatters';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  PackagePlus,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  MinusCircle
} from 'lucide-react';

export const ProductsView: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, bankTotalValue } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Form State for Adding / Editing
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    purchase_price: '',
    selling_price: '',
    quantity: '',
    category: 'أدوية علاجية',
  });

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [products, searchTerm, selectedCategory]);

  // Unique Categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((p) => p.category && cats.add(p.category));
    return Array.from(cats);
  }, [products]);

  // Open Add Modal
  const handleOpenAddModal = () => {
    const autoCode = generateCode('PRD', products.length);
    setFormData({
      code: autoCode,
      name: '',
      purchase_price: '',
      selling_price: '',
      quantity: '',
      category: 'أدوية علاجية',
    });
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      code: product.code,
      name: product.name,
      purchase_price: product.purchase_price.toString(),
      selling_price: product.selling_price.toString(),
      quantity: product.quantity.toString(),
      category: product.category || 'أدوية علاجية',
    });
  };

  // Handle Form Submit (Add or Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.purchase_price || !formData.selling_price || !formData.quantity) {
      return;
    }

    const pPrice = parseFloat(formData.purchase_price);
    const sPrice = parseFloat(formData.selling_price);
    const qty = parseInt(formData.quantity, 10);

    if (editingProduct) {
      await updateProduct(editingProduct.id, {
        code: formData.code,
        name: formData.name,
        purchase_price: pPrice,
        selling_price: sPrice,
        quantity: qty,
        category: formData.category,
      });
      setEditingProduct(null);
    } else {
      await addProduct({
        code: formData.code || generateCode('PRD', products.length),
        name: formData.name,
        purchase_price: pPrice,
        selling_price: sPrice,
        quantity: qty,
        category: formData.category,
      });
      setIsAddModalOpen(false);
    }
  };

  // Stock Quick Adjust (+1 or -1)
  const handleQuickStockAdjust = async (product: Product, delta: number) => {
    const newQty = Math.max(0, product.quantity + delta);
    await updateProduct(product.id, { quantity: newQty });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header Controls Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">قائمة أصناف المخزن والمنتجات</h2>
          <p className="text-slate-500 text-xs mt-1">
            إجمالي تكلفة الشراء المتاحة (إجمالي البنك): <span className="font-extrabold text-emerald-700 font-mono text-sm">{formatCurrency(bankTotalValue)}</span>
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="py-3 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <PackagePlus className="w-5 h-5" />
          <span>إضافة منتج جديد</span>
        </button>
      </div>

      {/* Search and Category Filters */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث باسم المنتج، كود المنتج (PRD-001)، أو التصنيف..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 w-full sm:w-48 cursor-pointer"
          >
            <option value="all">جميع التصنيفات ({products.length})</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            لا توجد منتجات تطابق البحث الحياتي. يمكنك إضافة منتج جديد بالنقر على زر الإضافة.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-4 px-6">الكود</th>
                  <th className="py-4 px-6">اسم المنتج</th>
                  <th className="py-4 px-6">سعر الشراء (EGP)</th>
                  <th className="py-4 px-6">سعر البيع (EGP)</th>
                  <th className="py-4 px-6">الكمية المتاحة</th>
                  <th className="py-4 px-6">إجمالي القيمة بالبنك</th>
                  <th className="py-4 px-6">حالة المخزون</th>
                  <th className="py-4 px-6 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredProducts.map((product) => {
                  const itemBankValue = product.quantity * product.purchase_price;
                  const isLowStock = product.quantity < 30;

                  return (
                    <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-emerald-700">{product.code}</td>
                      <td className="py-4 px-6 font-bold text-slate-900">
                        <div>{product.name}</div>
                        {product.category && (
                          <span className="text-[10px] text-slate-400 font-normal">{product.category}</span>
                        )}
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-slate-700">
                        {formatCurrency(product.purchase_price)}
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-emerald-700">
                        {formatCurrency(product.selling_price)}
                      </td>
                      <td className="py-4 px-6 font-mono">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleQuickStockAdjust(product, -1)}
                            title="إنقاص حبة"
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            <MinusCircle className="w-4 h-4" />
                          </button>
                          <span className="font-extrabold text-slate-900 min-w-[2rem] text-center">
                            {product.quantity}
                          </span>
                          <button
                            onClick={() => handleQuickStockAdjust(product, 1)}
                            title="زيادة حبة"
                            className="p-1 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                          >
                            <PlusCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono font-extrabold text-slate-900">
                        {formatCurrency(itemBankValue)}
                      </td>
                      <td className="py-4 px-6">
                        {isLowStock ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>مخزون منخفض ({product.quantity})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>متوفر بالكامل</span>
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEditModal(product)}
                            title="تعديل المنتج"
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingProduct(product)}
                            title="حذف المنتج"
                            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add / Edit Product */}
      {(isAddModalOpen || editingProduct) && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-slide-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <h3 className="text-lg font-extrabold text-slate-900">
                {editingProduct ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد للمخزن'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingProduct(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">كود المنتج</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">التصنيف الطبي</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="أدوية علاجية، أجهزة، مستلزمات..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">اسم المنتج بالكامل</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: بندول إكسترا 500 مجم (24 قرص)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">سعر الشراء (ج.م)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="0"
                    value={formData.purchase_price}
                    onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                    placeholder="35.00"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">سعر البيع (ج.م)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="0"
                    value={formData.selling_price}
                    onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                    placeholder="48.00"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">الكمية المتاحة</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="100"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Profit preview badge */}
              {formData.purchase_price && formData.selling_price && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex justify-between">
                  <span>هامش ربح القطعة الواحدة:</span>
                  <span className="font-bold font-mono">
                    {(parseFloat(formData.selling_price || '0') - parseFloat(formData.purchase_price || '0')).toFixed(2)} ج.م
                  </span>
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {editingProduct ? 'حفظ التغييرات' : 'إضافة المنتج فوراً'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-4 border border-slate-100 shadow-2xl animate-scale-up">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">حذف المنتج من المخزن؟</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              هل أنت تأكد من حذف المنتج "{deletingProduct.name}"؟ لن يتم حذف الفواتير السابقة المرتبطة بهذا المنتج.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={async () => {
                  await deleteProduct(deletingProduct.id);
                  setDeletingProduct(null);
                }}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
              >
                تأكيد الحذف
              </button>
              <button
                onClick={() => setDeletingProduct(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
