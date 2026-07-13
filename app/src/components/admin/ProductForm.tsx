import { useEffect, useState } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { fileToCompressedDataUrl } from "@/lib/image";
import { VEHICLE_BRANDS, YEARS, type Product } from "@/types";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

interface ProductFormProps {
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function ProductForm({ product, onClose, onSaved }: ProductFormProps) {
  const { data: categories } = trpc.category.list.useQuery();
  const createProduct = trpc.product.create.useMutation({ onSuccess: onSaved });
  const updateProduct = trpc.product.update.useMutation({ onSuccess: onSaved });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: product?.name || "",
    sku: product?.sku || "",
    slug: product?.slug || "",
    categoryId: product?.categoryId || 0,
    subcategoryId: product?.subcategoryId || 0,
    carBrand: product?.carBrand || VEHICLE_BRANDS[0].name,
    carModel: product?.carModel || VEHICLE_BRANDS[0].models[0],
    yearFrom: product?.yearFrom || YEARS[YEARS.length - 1],
    yearTo: product?.yearTo || YEARS[0],
    engineVariant: product?.engineVariant || "",
    condition: product?.condition || "new",
    qualityType: product?.qualityType || "genuine",
    purchasePrice: product?.purchasePrice || "",
    sellingPrice: product?.sellingPrice || "",
    marketPriceMin: product?.marketPriceMin || "",
    marketPriceMax: product?.marketPriceMax || "",
    stockQuantity: product?.stockQuantity ?? 0,
    minStockAlert: product?.minStockAlert ?? 5,
    supplierName: product?.supplierName || "",
    warranty: product?.warranty || "",
    returnPolicy: product?.returnPolicy || "",
    description: product?.description || "",
    specifications: product?.specifications || "",
    featured: product?.featured || false,
  });
  const [images, setImages] = useState<string[]>(() => {
    if (!product?.images) return product?.image ? [product.image] : [];
    try {
      const parsed = JSON.parse(product.images);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return product.image ? [product.image] : [];
    }
  });

  const selectedBrand = VEHICLE_BRANDS.find((b) => b.name === form.carBrand) || VEHICLE_BRANDS[0];
  const selectedCategory = categories?.find((c) => c.id === form.categoryId);

  useEffect(() => {
    if (!product && form.name) {
      setForm((f) => ({ ...f, slug: slugify(f.name) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.name]);

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const encoded = await Promise.all(Array.from(files).map((f) => fileToCompressedDataUrl(f)));
      setImages((prev) => [...prev, ...encoded]);
    } catch {
      setError("Failed to process image(s)");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.sku || !form.slug || !form.categoryId || !form.sellingPrice) {
      setError("Name, SKU, slug, category and selling price are required");
      return;
    }

    const stockQuantity = Number(form.stockQuantity);
    const minStockAlert = Number(form.minStockAlert);
    const stockStatus = stockQuantity <= 0 ? "out_of_stock" : stockQuantity <= minStockAlert ? "low_stock" : "in_stock";

    const payload = {
      name: form.name,
      sku: form.sku,
      slug: form.slug,
      categoryId: Number(form.categoryId),
      subcategoryId: form.subcategoryId ? Number(form.subcategoryId) : undefined,
      carBrand: form.carBrand,
      carModel: form.carModel,
      yearFrom: Number(form.yearFrom),
      yearTo: Number(form.yearTo),
      engineVariant: form.engineVariant || undefined,
      condition: form.condition as "new" | "used",
      qualityType: form.qualityType as "genuine" | "oem" | "aftermarket",
      purchasePrice: form.purchasePrice || "0",
      sellingPrice: form.sellingPrice,
      marketPriceMin: form.marketPriceMin || undefined,
      marketPriceMax: form.marketPriceMax || undefined,
      stockQuantity,
      minStockAlert,
      supplierName: form.supplierName || undefined,
      warranty: form.warranty || undefined,
      returnPolicy: form.returnPolicy || undefined,
      description: form.description || undefined,
      specifications: form.specifications || undefined,
      featured: form.featured,
      stockStatus: stockStatus as "in_stock" | "low_stock" | "out_of_stock",
      image: images[0] || undefined,
      images: images.length ? JSON.stringify(images) : undefined,
    };

    if (product) {
      updateProduct.mutate({ id: product.id, ...payload });
    } else {
      createProduct.mutate(payload);
    }
  };

  const isSaving = createProduct.isPending || updateProduct.isPending;
  const profit =
    Number(form.sellingPrice || 0) - Number(form.purchasePrice || 0);

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 flex items-start justify-center overflow-y-auto p-4 py-10">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-3xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 bg-[#111] rounded-t-2xl">
          <h2 className="text-lg font-semibold text-white">{product ? "Edit Product" : "Add Product"}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && <p className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>}

          {/* Images */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Product Images</label>
            <div className="flex flex-wrap gap-3">
              {images.map((img, i) => (
                <div key={i} className="relative w-20 h-20">
                  <img src={img} alt="" className="w-20 h-20 object-cover rounded-lg border border-white/10" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
              <label className="w-20 h-20 border border-dashed border-white/20 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                {uploading ? (
                  <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                ) : (
                  <Upload className="w-5 h-5 text-gray-500" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleImageUpload(e.target.files)}
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Product Name *">
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="SKU *">
              <input className="input" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            </Field>
            <Field label="Slug *">
              <input className="input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </Field>
            <Field label="Category *">
              <select
                className="input"
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value), subcategoryId: 0 })}
              >
                <option value={0}>Select category</option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Subcategory">
              <select className="input" value={form.subcategoryId} onChange={(e) => setForm({ ...form, subcategoryId: Number(e.target.value) })}>
                <option value={0}>None</option>
                {selectedCategory?.subcategories?.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Featured">
              <button
                type="button"
                onClick={() => setForm({ ...form, featured: !form.featured })}
                className={`input flex items-center justify-between ${form.featured ? "text-blue-400" : "text-gray-400"}`}
              >
                {form.featured ? "Featured" : "Not featured"}
              </button>
            </Field>

            <Field label="Car Brand">
              <select
                className="input"
                value={form.carBrand}
                onChange={(e) => {
                  const brand = VEHICLE_BRANDS.find((b) => b.name === e.target.value)!;
                  setForm({ ...form, carBrand: brand.name, carModel: brand.models[0] });
                }}
              >
                {VEHICLE_BRANDS.map((b) => (
                  <option key={b.name} value={b.name}>{b.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Car Model">
              <select className="input" value={form.carModel} onChange={(e) => setForm({ ...form, carModel: e.target.value })}>
                {selectedBrand.models.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </Field>
            <Field label="Year From">
              <select className="input" value={form.yearFrom} onChange={(e) => setForm({ ...form, yearFrom: Number(e.target.value) })}>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </Field>
            <Field label="Year To">
              <select className="input" value={form.yearTo} onChange={(e) => setForm({ ...form, yearTo: Number(e.target.value) })}>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </Field>
            <Field label="Engine / Variant">
              <input className="input" value={form.engineVariant} onChange={(e) => setForm({ ...form, engineVariant: e.target.value })} />
            </Field>
            <Field label="Condition">
              <select className="input" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}>
                <option value="new">New</option>
                <option value="used">Used</option>
              </select>
            </Field>
            <Field label="Quality Type">
              <select className="input" value={form.qualityType} onChange={(e) => setForm({ ...form, qualityType: e.target.value })}>
                <option value="genuine">Genuine</option>
                <option value="oem">OEM</option>
                <option value="aftermarket">Aftermarket</option>
              </select>
            </Field>

            <Field label="Purchase Price (PKR)">
              <input type="number" className="input" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })} />
            </Field>
            <Field label="Selling Price (PKR) *">
              <input type="number" className="input" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} />
            </Field>
            <Field label="Profit Margin">
              <div className="input text-green-400">PKR {isNaN(profit) ? 0 : profit.toLocaleString()}</div>
            </Field>
            <Field label="Market Price Min (PKR)">
              <input type="number" className="input" value={form.marketPriceMin} onChange={(e) => setForm({ ...form, marketPriceMin: e.target.value })} />
            </Field>
            <Field label="Market Price Max (PKR)">
              <input type="number" className="input" value={form.marketPriceMax} onChange={(e) => setForm({ ...form, marketPriceMax: e.target.value })} />
            </Field>
            <Field label="Stock Quantity">
              <input type="number" className="input" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: Number(e.target.value) })} />
            </Field>
            <Field label="Minimum Stock Alert">
              <input type="number" className="input" value={form.minStockAlert} onChange={(e) => setForm({ ...form, minStockAlert: Number(e.target.value) })} />
            </Field>
            <Field label="Supplier (admin only)">
              <input className="input" value={form.supplierName} onChange={(e) => setForm({ ...form, supplierName: e.target.value })} />
            </Field>
            <Field label="Warranty">
              <input className="input" value={form.warranty} onChange={(e) => setForm({ ...form, warranty: e.target.value })} />
            </Field>
            <Field label="Return Policy">
              <input className="input" value={form.returnPolicy} onChange={(e) => setForm({ ...form, returnPolicy: e.target.value })} />
            </Field>
          </div>

          <Field label="Description">
            <textarea className="input min-h-20" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <Field label="Specifications">
            <textarea className="input min-h-20" value={form.specifications} onChange={(e) => setForm({ ...form, specifications: e.target.value })} />
          </Field>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isSaving ? "Saving..." : product ? "Save Changes" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-gray-400 mb-1 block">{label}</label>
      {children}
    </div>
  );
}
