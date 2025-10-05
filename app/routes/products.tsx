import type { MetaFunction } from "react-router";
import { api } from "convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { useState } from "react";
import type { Id } from "convex/_generated/dataModel";
import {
  WEIGHT_UNITS,
  DIMENSION_UNITS,
  formatWeight,
  formatDimensions,
  type WeightUnit,
  type DimensionUnit,
} from "../lib/units";

export const meta: MetaFunction = () => {
  return [
    { title: "Products | WMS" },
    { name: "description", content: "Manage warehouse products" },
  ];
};

const PRODUCT_TYPES = [
  { value: "rigid", label: "Rigid" },
  { value: "textile", label: "Textile" },
  { value: "fragile", label: "Fragile" },
  { value: "perishable", label: "Perishable" },
  { value: "hazmat", label: "Hazmat" },
  { value: "liquid", label: "Liquid" },
  { value: "other", label: "Other" },
] as const;

export default function Products() {
  const products = useQuery(api.products.list, {});
  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);
  const toggleActive = useMutation(api.products.toggleActive);
  const removeProduct = useMutation(api.products.remove);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<Id<"products"> | null>(null);

  const [formData, setFormData] = useState({
    sku: "",
    upc: "",
    title: "",
    description: "",
    productType: "other" as const,
    weight: "",
    weightUnit: "oz" as WeightUnit,
    length: "",
    width: "",
    height: "",
    dimensionUnit: "in" as DimensionUnit,
    countryOfOrigin: "",
    hsTariffCode: "",
    lotTracked: false,
    serialTracked: false,
    expirationTracked: false,
    minStockLevel: "",
    maxStockLevel: "",
  });

  const resetForm = () => {
    setFormData({
      sku: "",
      upc: "",
      title: "",
      description: "",
      productType: "other",
      weight: "",
      weightUnit: "oz",
      length: "",
      width: "",
      height: "",
      dimensionUnit: "in",
      countryOfOrigin: "",
      hsTariffCode: "",
      lotTracked: false,
      serialTracked: false,
      expirationTracked: false,
      minStockLevel: "",
      maxStockLevel: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.sku || !formData.title || !formData.weight || !formData.length || !formData.width || !formData.height) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const productData = {
        sku: formData.sku,
        upc: formData.upc || undefined,
        title: formData.title,
        description: formData.description || undefined,
        productType: formData.productType,
        weight: parseFloat(formData.weight),
        weightUnit: formData.weightUnit,
        length: parseFloat(formData.length),
        width: parseFloat(formData.width),
        height: parseFloat(formData.height),
        dimensionUnit: formData.dimensionUnit,
        countryOfOrigin: formData.countryOfOrigin || undefined,
        hsTariffCode: formData.hsTariffCode || undefined,
        lotTracked: formData.lotTracked,
        serialTracked: formData.serialTracked,
        expirationTracked: formData.expirationTracked,
        minStockLevel: formData.minStockLevel ? parseInt(formData.minStockLevel) : undefined,
        maxStockLevel: formData.maxStockLevel ? parseInt(formData.maxStockLevel) : undefined,
      };

      if (editingId) {
        await updateProduct({ id: editingId, ...productData });
      } else {
        await createProduct(productData);
      }

      resetForm();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save product");
    }
  };

  const handleEdit = (product: any) => {
    setFormData({
      sku: product.sku,
      upc: product.upc || "",
      title: product.title,
      description: product.description || "",
      productType: product.productType,
      weight: product.weight.toString(),
      weightUnit: product.weightUnit,
      length: product.length.toString(),
      width: product.width.toString(),
      height: product.height.toString(),
      dimensionUnit: product.dimensionUnit,
      countryOfOrigin: product.countryOfOrigin || "",
      hsTariffCode: product.hsTariffCode || "",
      lotTracked: product.lotTracked,
      serialTracked: product.serialTracked,
      expirationTracked: product.expirationTracked,
      minStockLevel: product.minStockLevel?.toString() || "",
      maxStockLevel: product.maxStockLevel?.toString() || "",
    });
    setEditingId(product._id);
    setShowForm(true);
  };

  const handleDelete = async (id: Id<"products">) => {
    if (confirm("Are you sure you want to delete this product?")) {
      await removeProduct({ id });
    }
  };

  const inputClass = "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Product Manager</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`px-6 py-2 font-medium rounded-lg transition-colors ${
            showForm
              ? "bg-gray-600 hover:bg-gray-700 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {showForm ? "Cancel" : "➕ Add Product"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {editingId ? "Edit Product" : "Add New Product"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className={labelClass}>SKU *</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className={labelClass}>UPC/Barcode</label>
              <input
                type="text"
                value={formData.upc}
                onChange={(e) => setFormData({ ...formData, upc: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div className="mb-6">
            <label className={labelClass}>Product Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={inputClass}
              required
            />
          </div>

          <div className="mb-6">
            <label className={labelClass}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`${inputClass} min-h-[80px]`}
            />
          </div>

          <div className="mb-6">
            <label className={labelClass}>Product Type *</label>
            <select
              value={formData.productType}
              onChange={(e) => setFormData({ ...formData, productType: e.target.value as any })}
              className={inputClass}
              required
            >
              {PRODUCT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Physical Dimensions</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="md:col-span-2">
              <label className={labelClass}>Weight *</label>
              <input
                type="number"
                step="0.01"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Unit</label>
              <select
                value={formData.weightUnit}
                onChange={(e) => setFormData({ ...formData, weightUnit: e.target.value as WeightUnit })}
                className={inputClass}
              >
                {WEIGHT_UNITS.map((unit) => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className={labelClass}>Length *</label>
              <input
                type="number"
                step="0.01"
                value={formData.length}
                onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Width *</label>
              <input
                type="number"
                step="0.01"
                value={formData.width}
                onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Height *</label>
              <input
                type="number"
                step="0.01"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Unit</label>
              <select
                value={formData.dimensionUnit}
                onChange={(e) => setFormData({ ...formData, dimensionUnit: e.target.value as DimensionUnit })}
                className={inputClass}
              >
                {DIMENSION_UNITS.map((unit) => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tracking Options</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.lotTracked}
                onChange={(e) => setFormData({ ...formData, lotTracked: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
              />
              Lot/Batch Tracked
            </label>
            <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.serialTracked}
                onChange={(e) => setFormData({ ...formData, serialTracked: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
              />
              Serial Tracked
            </label>
            <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.expirationTracked}
                onChange={(e) => setFormData({ ...formData, expirationTracked: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
              />
              Expiration Tracked
            </label>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              {editingId ? "Update Product" : "Create Product"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Products</h2>
        {products === undefined ? (
          <p className="text-gray-500 dark:text-gray-400">Loading products...</p>
        ) : products.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">No products yet. Add your first product above!</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">SKU</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Title</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Weight</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Dimensions</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">{product.sku}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{product.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 capitalize">{product.productType}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {formatWeight(product.weight, product.weightUnit)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {formatDimensions(product.length, product.width, product.height, product.dimensionUnit)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            product.active
                              ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                              : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                          }`}
                        >
                          {product.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => toggleActive({ id: product._id })}
                            className="px-3 py-1 text-sm bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors"
                          >
                            Toggle
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
