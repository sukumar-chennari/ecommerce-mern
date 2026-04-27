import { useState, useRef, useCallback } from "react";

interface ProductFormProps {
    initialValues?: any;
    onSubmit: (formData: FormData) => Promise<void>;
    isLoading?: boolean;
}

const ProductForm = ({
    initialValues,
    onSubmit,
    isLoading,
}: ProductFormProps) => {
    // ─── Text fields ───────────────────────────────────────────────
    const [form, setForm] = useState({
        name: initialValues?.name || "",
        description: initialValues?.description || "",
        price: initialValues?.price || "",
        category: initialValues?.category || "",
        brand: initialValues?.brand || "",
        stock: initialValues?.stock || "",
    });

    // ─── Image state ───────────────────────────────────────────────
    // URLs already stored in Cloudinary / DB
    const [existingImages, setExistingImages] = useState<string[]>(
        initialValues?.images || []
    );
    // Locally selected files not yet uploaded
    const [newImages, setNewImages] = useState<File[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // ─── Handlers ──────────────────────────────────────────────────
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Append selected files (not replace)
    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files.length > 0) {
                const selected = Array.from(e.target.files);
                setNewImages((prev) => [...prev, ...selected]);
                // Reset so selecting the same file again triggers onChange
                e.target.value = "";
            }
        },
        []
    );

    const handleRemoveExisting = useCallback(
        (idx: number) => setExistingImages((prev) => prev.filter((_, i) => i !== idx)),
        []
    );

    const handleRemoveNew = useCallback(
        (idx: number) => setNewImages((prev) => prev.filter((_, i) => i !== idx)),
        []
    );

    const handleClearAll = useCallback(() => {
        setExistingImages([]);
        setNewImages([]);
    }, []);

    // ─── Submit ────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();

        // 1) Text fields
        Object.entries(form).forEach(([key, value]) => {
            formData.append(key, String(value));
        });

        // 2) Existing image URLs to KEEP  →  sent as a single JSON string
        //    The backend parses this to know which old images remain.
        formData.append("existingImages", JSON.stringify(existingImages));

        // 3) Newly selected files  →  each appended as a binary under "images"
        //    Multer on the backend processes these as file uploads.
        newImages.forEach((file) => {
            formData.append("images", file);
        });

        await onSubmit(formData);
    };

    // ─── Total image count ─────────────────────────────────────────
    const totalImages = existingImages.length + newImages.length;

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* ── Text Inputs ──────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-textMuted uppercase tracking-widest ml-1">Product Name</label>
                    <input name="name" value={form.name} onChange={handleChange}
                        placeholder="e.g. Premium Wireless Headphones" className="w-full bg-white border border-gray-200 p-4 rounded-2xl text-sm focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all shadow-sm" required />
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-textMuted uppercase tracking-widest ml-1">Category</label>
                    <input name="category" value={form.category} onChange={handleChange}
                        placeholder="e.g. Electronics" className="w-full bg-white border border-gray-200 p-4 rounded-2xl text-sm focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all shadow-sm" required />
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-textMuted uppercase tracking-widest ml-1">Brand</label>
                    <input name="brand" value={form.brand} onChange={handleChange}
                        placeholder="e.g. Sony" className="w-full bg-white border border-gray-200 p-4 rounded-2xl text-sm focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all shadow-sm" required />
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-textMuted uppercase tracking-widest ml-1">Price (₹)</label>
                    <input type="number" name="price" value={form.price} onChange={handleChange}
                        placeholder="0.00" className="w-full bg-white border border-gray-200 p-4 rounded-2xl text-sm focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all shadow-sm" required />
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-textMuted uppercase tracking-widest ml-1">Stock Quantity</label>
                    <input type="number" name="stock" value={form.stock} onChange={handleChange}
                        placeholder="0" className="w-full bg-white border border-gray-200 p-4 rounded-2xl text-sm focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all shadow-sm" required />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-[10px] font-bold text-textMuted uppercase tracking-widest ml-1">Product Description</label>
                <textarea name="description" value={form.description} onChange={handleChange}
                    placeholder="Provide a detailed description of the product features, specifications, and benefits..." rows={5}
                    className="w-full bg-white border border-gray-200 p-4 rounded-2xl text-sm focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all shadow-sm resize-none" required />
            </div>

            {/* ── Image Management ─────────────────────────────────── */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-bold text-textMuted uppercase tracking-widest">
                        Product Gallery ({totalImages})
                    </label>
                    {totalImages > 0 && (
                        <button type="button" onClick={handleClearAll}
                            className="text-[10px] text-danger hover:text-danger/80 font-bold uppercase tracking-widest transition-colors">
                            Remove All
                        </button>
                    )}
                </div>

                {/* File picker */}
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="group border-2 border-dashed border-gray-200 hover:border-primary/50 hover:bg-primary/5 rounded-3xl p-10 text-center cursor-pointer transition-all duration-300"
                >
                    <div className="w-16 h-16 bg-gray-50 group-hover:bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
                        <svg className="w-8 h-8 text-gray-300 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <p className="text-sm font-bold text-textPrimary">
                        Drop images here or <span className="text-primary underline">browse files</span>
                    </p>
                    <p className="text-xs text-textMuted mt-2">Maximum 5 high-quality product images (JPG, PNG, WebP)</p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp,image/jpg"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </div>

                {/* Previews */}
                {totalImages > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
                        {/* Existing Cloudinary images */}
                        {existingImages.map((url, idx) => (
                            <div key={`exist-${idx}`} className="relative group aspect-square rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                                <img src={url} alt={`Product ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveExisting(idx)}
                                    className="absolute top-2 right-2 bg-white/90 backdrop-blur-md text-danger w-8 h-8 rounded-xl flex items-center justify-center text-xs shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-danger hover:text-white"
                                    title="Remove this image"
                                >
                                    ✕
                                </button>
                                <div className="absolute inset-x-0 bottom-0 bg-white/90 backdrop-blur-md text-textPrimary text-[8px] text-center py-1 font-bold tracking-widest uppercase border-t border-gray-100">
                                    Saved Image
                                </div>
                            </div>
                        ))}

                        {/* Newly selected local files */}
                        {newImages.map((file, idx) => (
                            <div key={`new-${idx}`} className="relative group aspect-square rounded-2xl overflow-hidden shadow-sm border border-primary/20">
                                <img src={URL.createObjectURL(file)} alt={`New ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveNew(idx)}
                                    className="absolute top-2 right-2 bg-white/90 backdrop-blur-md text-danger w-8 h-8 rounded-xl flex items-center justify-center text-xs shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-danger hover:text-white"
                                    title="Remove this image"
                                >
                                    ✕
                                </button>
                                <div className="absolute inset-x-0 bottom-0 bg-primary/90 backdrop-blur-md text-white text-[8px] text-center py-1 font-bold tracking-widest uppercase border-t border-primary/10">
                                    Ready to Upload
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Submit Button ─────────────────────────────────────── */}
            <div className="pt-6">
                <button disabled={isLoading}
                    className="w-full bg-primary text-white py-5 rounded-2xl font-bold text-sm uppercase tracking-widest hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-3">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Processing...</span>
                        </div>
                    ) : initialValues ? "Update Product Catalog" : "Add to Store Catalog"}
                </button>
            </div>
        </form>
    );
};

export default ProductForm;