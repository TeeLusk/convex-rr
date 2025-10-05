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

  return (
    <div style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ margin: 0 }}>Product Manager</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: showForm ? "#666" : "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {showForm ? "Cancel" : "➕ Add Product"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            backgroundColor: "#f5f5f5",
            padding: "2rem",
            borderRadius: "8px",
            marginBottom: "2rem",
          }}
        >
          <h2>{editingId ? "Edit Product" : "Add New Product"}</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                SKU *
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
                required
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                UPC/Barcode
              </label>
              <input
                type="text"
                value={formData.upc}
                onChange={(e) => setFormData({ ...formData, upc: e.target.value })}
                style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
              Product Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
              required
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc", minHeight: "80px" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                Product Type *
              </label>
              <select
                value={formData.productType}
                onChange={(e) => setFormData({ ...formData, productType: e.target.value as any })}
                style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
                required
              >
                {PRODUCT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <h3 style={{ marginTop: "2rem", marginBottom: "1rem" }}>Physical Dimensions</h3>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                Weight *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
                required
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                Unit
              </label>
              <select
                value={formData.weightUnit}
                onChange={(e) => setFormData({ ...formData, weightUnit: e.target.value as WeightUnit })}
                style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
              >
                {WEIGHT_UNITS.map((unit) => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                Length *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.length}
                onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
                required
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                Width *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.width}
                onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
                required
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                Height *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
                required
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                Unit
              </label>
              <select
                value={formData.dimensionUnit}
                onChange={(e) => setFormData({ ...formData, dimensionUnit: e.target.value as DimensionUnit })}
                style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
              >
                {DIMENSION_UNITS.map((unit) => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <h3 style={{ marginTop: "2rem", marginBottom: "1rem" }}>Tracking Options</h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input
                type="checkbox"
                checked={formData.lotTracked}
                onChange={(e) => setFormData({ ...formData, lotTracked: e.target.checked })}
              />
              Lot/Batch Tracked
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input
                type="checkbox"
                checked={formData.serialTracked}
                onChange={(e) => setFormData({ ...formData, serialTracked: e.target.checked })}
              />
              Serial Tracked
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input
                type="checkbox"
                checked={formData.expirationTracked}
                onChange={(e) => setFormData({ ...formData, expirationTracked: e.target.checked })}
              />
              Expiration Tracked
            </label>
          </div>

          <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
            <button
              type="submit"
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#0070f3",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              {editingId ? "Update Product" : "Create Product"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#666",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div style={{ marginTop: "2rem" }}>
        <h2>Products</h2>
        {products === undefined ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products yet. Add your first product above!</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "white" }}>
              <thead>
                <tr style={{ backgroundColor: "#f5f5f5", borderBottom: "2px solid #ddd" }}>
                  <th style={{ padding: "1rem", textAlign: "left" }}>SKU</th>
                  <th style={{ padding: "1rem", textAlign: "left" }}>Title</th>
                  <th style={{ padding: "1rem", textAlign: "left" }}>Type</th>
                  <th style={{ padding: "1rem", textAlign: "left" }}>Weight</th>
                  <th style={{ padding: "1rem", textAlign: "left" }}>Dimensions</th>
                  <th style={{ padding: "1rem", textAlign: "center" }}>Status</th>
                  <th style={{ padding: "1rem", textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "1rem", fontFamily: "monospace" }}>{product.sku}</td>
                    <td style={{ padding: "1rem" }}>{product.title}</td>
                    <td style={{ padding: "1rem", textTransform: "capitalize" }}>{product.productType}</td>
                    <td style={{ padding: "1rem" }}>
                      {formatWeight(product.weight, product.weightUnit)}
                    </td>
                    <td style={{ padding: "1rem" }}>
                      {formatDimensions(product.length, product.width, product.height, product.dimensionUnit)}
                    </td>
                    <td style={{ padding: "1rem", textAlign: "center" }}>
                      <span
                        style={{
                          padding: "0.25rem 0.75rem",
                          borderRadius: "12px",
                          backgroundColor: product.active ? "#d4edda" : "#f8d7da",
                          color: product.active ? "#155724" : "#721c24",
                          fontSize: "0.875rem",
                        }}
                      >
                        {product.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ padding: "1rem", textAlign: "center" }}>
                      <button
                        onClick={() => handleEdit(product)}
                        style={{
                          padding: "0.5rem 1rem",
                          marginRight: "0.5rem",
                          backgroundColor: "#0070f3",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleActive({ id: product._id })}
                        style={{
                          padding: "0.5rem 1rem",
                          marginRight: "0.5rem",
                          backgroundColor: "#ffc107",
                          color: "black",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        Toggle
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        style={{
                          padding: "0.5rem 1rem",
                          backgroundColor: "#dc3545",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        Delete
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
  );
}
