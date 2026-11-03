import React, { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Check, X, Sparkles, Coffee, Clock, Layers, PlusCircle } from "lucide-react";
import OwnerHeader from "../../components/owner/OwnerHeader";
import api from "../../services/api";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form State with Variants & Add-ons
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    description: "",
    image: "",
    isVegetarian: true,
    preparationTimeMinutes: 10,
    tags: "",
    variants: [],
    addOns: [],
  });

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
      ]);
      if (prodRes.success) setProducts(prodRes.products);
      if (catRes.success) setCategories(catRes.categories);
    } catch (err) {
      console.warn("[Products] Load error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStock = async (id) => {
    try {
      await api.toggleProductStock(id);
      fetchData();
    } catch (err) {
      alert("Error updating stock: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this menu product?")) {
      try {
        await api.deleteProduct(id);
        fetchData();
      } catch (err) {
        alert("Error deleting product: " + err.message);
      }
    }
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      category: categories[0]?._id || "",
      price: "",
      description: "",
      image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
      isVegetarian: true,
      preparationTimeMinutes: 10,
      tags: "Popular",
      variants: [],
      addOns: [],
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category?._id || product.category || categories[0]?._id || "",
      price: product.price.toString(),
      description: product.description || "",
      image: product.image || "",
      isVegetarian: product.isVegetarian !== undefined ? product.isVegetarian : true,
      preparationTimeMinutes: product.preparationTimeMinutes || 10,
      tags: product.tags?.join(", ") || "",
      variants: product.variants ? product.variants.map((v) => ({ name: v.name, price: v.price })) : [],
      addOns: product.addOns ? product.addOns.map((a) => ({ name: a.name, price: a.price })) : [],
    });
    setShowAddModal(true);
  };

  // Add / Remove Variant helper
  const handleAddVariantField = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, { name: "", price: "" }],
    }));
  };

  const handleVariantChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.variants];
      updated[index][field] = value;
      return { ...prev, variants: updated };
    });
  };

  const handleRemoveVariantField = (index) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  // Add / Remove Add-on helper
  const handleAddOnField = () => {
    setFormData((prev) => ({
      ...prev,
      addOns: [...prev.addOns, { name: "", price: "" }],
    }));
  };

  const handleAddOnChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.addOns];
      updated[index][field] = value;
      return { ...prev, addOns: updated };
    });
  };

  const handleRemoveAddOnField = (index) => {
    setFormData((prev) => ({
      ...prev,
      addOns: prev.addOns.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const cleanVariants = formData.variants
        .filter((v) => v.name && v.name.trim() !== "" && !isNaN(Number(v.price)))
        .map((v) => ({ name: v.name.trim(), price: Number(v.price), isAvailable: true }));

      const cleanAddOns = formData.addOns
        .filter((a) => a.name && a.name.trim() !== "" && !isNaN(Number(a.price)))
        .map((a) => ({ name: a.name.trim(), price: Number(a.price), isAvailable: true }));

      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        price: Number(formData.price),
        description: formData.description.trim(),
        image: formData.image.trim(),
        isVegetarian: formData.isVegetarian,
        preparationTimeMinutes: Number(formData.preparationTimeMinutes) || 10,
        tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
        variants: cleanVariants,
        addOns: cleanAddOns,
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct._id, payload);
      } else {
        await api.createProduct(payload);
      }

      setShowAddModal(false);
      fetchData();
    } catch (err) {
      alert("Error saving product: " + err.message);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <OwnerHeader
        title="Products & Menu Management"
        subtitle="Manage coffee, pizzas, food specials, size variants, add-ons, and stock"
        actions={
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-[#C8752A] hover:bg-[#6B3515] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-caramel-glow transition-colors"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Add New Item</span>
          </button>
        }
      />

      {/* Product List Table / Grid */}
      <div className="bg-[#FFFDFC] rounded-3xl border border-[#DCC9B3] overflow-hidden shadow-cozy">
        <div className="p-4 bg-[#EFE0CB]/60 border-b border-[#DCC9B3]/40 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#765F4D]">
            {products.length} Menu Items Total
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-[#765F4D]">Loading menu products...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-[#765F4D] text-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#EFE0CB] border border-[#DCC9B3] flex items-center justify-center mx-auto mb-3 text-[#C8752A]">
              <Coffee className="w-6 h-6" />
            </div>
            <p className="text-sm font-serif font-bold text-[#24160F]">No products found</p>
            <p className="text-xs text-[#765F4D] mt-0.5">Click "Add New Item" to create your first beverage or food item.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#DCC9B3]/40">
            {products.map((product) => (
              <div
                key={product._id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FBF6EE] transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={product.image || "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80"}
                    alt={product.name}
                    className="w-14 h-14 rounded-2xl object-cover bg-[#EFE0CB] border border-[#DCC9B3] shrink-0 shadow-xs"
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-serif font-bold text-[#24160F]">{product.name}</h4>
                      {product.isVegetarian ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFFDFC] text-[#4F8061] border border-[#4F8061]">
                          Veg
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFFDFC] text-[#B8543E] border border-[#B8543E]">
                          Non-Veg
                        </span>
                      )}
                      <span className="text-[10px] text-[#765F4D] bg-[#EFE0CB] border border-[#DCC9B3] px-2 py-0.5 rounded-full font-medium">
                        {product.category?.name || "Uncategorized"}
                      </span>
                    </div>

                    <p className="text-xs text-[#765F4D] line-clamp-1 mt-0.5">
                      {product.description || "No description provided."}
                    </p>

                    {/* Variants and Add-ons tags */}
                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-[#765F4D]">
                      <span className="font-serif font-bold text-[#C8752A] text-xs">
                        ₹{Number(product.price).toFixed(2)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#C8752A]" />
                        {product.preparationTimeMinutes} min
                      </span>

                      {product.variants && product.variants.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-[10px] font-semibold text-[#8B4A1D] bg-[#F5EBDD] px-2 py-0.5 rounded-md">
                            {product.variants.length} Sizes ({product.variants.map((v) => v.name).join(", ")})
                          </span>
                        </>
                      )}

                      {product.addOns && product.addOns.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-[10px] font-semibold text-[#4F8061] bg-[#F5EBDD] px-2 py-0.5 rounded-md">
                            {product.addOns.length} Add-ons
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stock toggle and edit buttons */}
                <div className="flex items-center gap-2.5 self-end sm:self-center">
                  <button
                    onClick={() => handleToggleStock(product._id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      product.isAvailable
                        ? "bg-[#FFFDFC] text-[#4F8061] border-[#4F8061] hover:bg-[#EFE0CB]"
                        : "bg-[#FFFDFC] text-[#B8543E] border-[#B8543E] hover:bg-[#FBF6EE]"
                    }`}
                  >
                    {product.isAvailable ? "In Stock" : "Out of Stock"}
                  </button>

                  <button
                    onClick={() => handleOpenEdit(product)}
                    className="p-2 rounded-xl text-[#765F4D] hover:text-[#24160F] hover:bg-[#EFE0CB] border border-transparent hover:border-[#DCC9B3] transition-colors"
                    title="Edit Product"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(product._id)}
                    className="p-2 rounded-xl text-[#765F4D] hover:text-[#B8543E] hover:bg-[#FFFDFC] transition-colors"
                    title="Delete Product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal with Variants & Add-ons */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#24130A]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFFDFC] rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-[#DCC9B3] animate-in fade-in zoom-in-95 my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold font-serif text-[#24160F] mb-4">
              {editingProduct ? "Edit Product & Variants" : "Add New Menu Item"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#24160F] mb-1">Item Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Classic Margherita Pizza"
                  className="w-full px-3.5 py-2.5 bg-[#FBF6EE] border border-[#DCC9B3] text-[#24160F] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8752A]/40 focus:border-[#C8752A]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#24160F] mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FBF6EE] border border-[#DCC9B3] text-[#24160F] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8752A]/40 focus:border-[#C8752A]"
                    required
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#24160F] mb-1">Base Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="140"
                    className="w-full px-3.5 py-2.5 bg-[#FBF6EE] border border-[#DCC9B3] text-[#24160F] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8752A]/40 focus:border-[#C8752A]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#24160F] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Appetizing description for customer menu..."
                  className="w-full px-3.5 py-2 bg-[#FBF6EE] border border-[#DCC9B3] text-[#24160F] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8752A]/40 focus:border-[#C8752A] resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-[#24160F] mb-1">Image URL</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 bg-[#FBF6EE] border border-[#DCC9B3] text-[#24160F] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8752A]/40 focus:border-[#C8752A]"
                />
              </div>

              {/* PRODUCT SIZES & VARIANTS SECTION */}
              <div className="pt-3 border-t border-[#DCC9B3]">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-bold text-[#24160F] block">Product Sizes & Variants</span>
                    <span className="text-[11px] text-[#765F4D]">
                      e.g. Small (8in): ₹140, Medium (9in): ₹160, Large (10in): ₹200
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddVariantField}
                    className="px-2.5 py-1 rounded-lg bg-[#EFE0CB] hover:bg-[#DCC9B3] text-[#24160F] font-semibold text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Size</span>
                  </button>
                </div>

                {formData.variants.length > 0 && (
                  <div className="space-y-2 max-h-40 overflow-y-auto p-1 bg-[#FBF6EE] rounded-2xl border border-[#DCC9B3]/50">
                    {formData.variants.map((variant, vIdx) => (
                      <div key={vIdx} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Size (e.g. Medium 9in)"
                          value={variant.name}
                          onChange={(e) => handleVariantChange(vIdx, "name", e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-[#FFFDFC] border border-[#DCC9B3] rounded-lg text-xs"
                          required
                        />
                        <input
                          type="number"
                          placeholder="Price ₹"
                          value={variant.price}
                          onChange={(e) => handleVariantChange(vIdx, "price", e.target.value)}
                          className="w-24 px-3 py-1.5 bg-[#FFFDFC] border border-[#DCC9B3] rounded-lg text-xs"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveVariantField(vIdx)}
                          className="p-1 text-[#B8543E] hover:bg-[#FFFDFC] rounded-md"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* PRODUCT ADD-ONS SECTION */}
              <div className="pt-3 border-t border-[#DCC9B3]">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-bold text-[#24160F] block">Add-ons (Extras)</span>
                    <span className="text-[11px] text-[#765F4D]">
                      e.g. Cheese: ₹20, Egg: ₹25, Chicken: ₹30
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddOnField}
                    className="px-2.5 py-1 rounded-lg bg-[#EFE0CB] hover:bg-[#DCC9B3] text-[#24160F] font-semibold text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Extra</span>
                  </button>
                </div>

                {formData.addOns.length > 0 && (
                  <div className="space-y-2 max-h-40 overflow-y-auto p-1 bg-[#FBF6EE] rounded-2xl border border-[#DCC9B3]/50">
                    {formData.addOns.map((addOn, aIdx) => (
                      <div key={aIdx} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Add-on Name (e.g. Cheese)"
                          value={addOn.name}
                          onChange={(e) => handleAddOnChange(aIdx, "name", e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-[#FFFDFC] border border-[#DCC9B3] rounded-lg text-xs"
                          required
                        />
                        <input
                          type="number"
                          placeholder="Price ₹"
                          value={addOn.price}
                          onChange={(e) => handleAddOnChange(aIdx, "price", e.target.value)}
                          className="w-24 px-3 py-1.5 bg-[#FFFDFC] border border-[#DCC9B3] rounded-lg text-xs"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveAddOnField(aIdx)}
                          className="p-1 text-[#B8543E] hover:bg-[#FFFDFC] rounded-md"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 items-center pt-2">
                <div>
                  <label className="block font-semibold text-[#24160F] mb-1">Prep Time (mins)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.preparationTimeMinutes}
                    onChange={(e) => setFormData({ ...formData, preparationTimeMinutes: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FBF6EE] border border-[#DCC9B3] text-[#24160F] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8752A]/40 focus:border-[#C8752A]"
                  />
                </div>

                <div className="pt-4 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="vegCheck"
                    checked={formData.isVegetarian}
                    onChange={(e) => setFormData({ ...formData, isVegetarian: e.target.checked })}
                    className="w-4 h-4 rounded text-[#C8752A] focus:ring-[#C8752A] border-[#DCC9B3]"
                  />
                  <label htmlFor="vegCheck" className="font-semibold text-[#24160F] cursor-pointer">
                    Vegetarian Dish
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#24160F] mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="Bestseller, Spicy, Chef Special"
                  className="w-full px-3.5 py-2.5 bg-[#FBF6EE] border border-[#DCC9B3] text-[#24160F] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8752A]/40 focus:border-[#C8752A]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#DCC9B3]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-[#765F4D] hover:bg-[#EFE0CB] font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#C8752A] hover:bg-[#6B3515] text-white font-semibold shadow-caramel-glow transition-colors"
                >
                  Save Product & Options
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
