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
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* ── Text Inputs ──────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="name" value={form.name} onChange={handleChange}
                    placeholder="Product Name" className="w-full border p-3 rounded-xl bg-background" required />

                <input name="category" value={form.category} onChange={handleChange}
                    placeholder="Category" className="w-full border p-3 rounded-xl bg-background" required />

                <input name="brand" value={form.brand} onChange={handleChange}
                    placeholder="Brand" className="w-full border p-3 rounded-xl bg-background" required />

                <input type="number" name="price" value={form.price} onChange={handleChange}
                    placeholder="Price" className="w-full border p-3 rounded-xl bg-background" required />

                <input type="number" name="stock" value={form.stock} onChange={handleChange}
                    placeholder="Stock Quantity" className="w-full border p-3 rounded-xl bg-background" required />
            </div>

            <textarea name="description" value={form.description} onChange={handleChange}
                placeholder="Product Description" rows={4}
                className="w-full border p-3 rounded-xl bg-background" required />

            {/* ── Image Management ─────────────────────────────────── */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="block text-sm font-semibold text-textSecondary uppercase tracking-wider">
                        Product Images ({totalImages})
                    </label>
                    {totalImages > 0 && (
                        <button type="button" onClick={handleClearAll}
                            className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors">
                            Clear All
                        </button>
                    )}
                </div>

                {/* File picker */}
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 hover:border-primary/50 rounded-xl p-6 text-center cursor-pointer transition-colors"
                >
                    <p className="text-sm text-gray-500">
                        <span className="font-semibold text-primary">Click to browse</span> or drag & drop images here
                    </p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, JPEG, WebP • Max 5 images per upload</p>
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
                    <div className="flex flex-wrap gap-4 mt-4">
                        {/* Existing Cloudinary images */}
                        {existingImages.map((url, idx) => (
                            <div key={`exist-${idx}`} className="relative w-28 h-28 rounded-xl overflow-hidden shadow-md border-2 border-gray-200">
                                <img src={url} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveExisting(idx)}
                                    className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold shadow-lg transition-all active:scale-90"
                                    title="Remove this image"
                                >
                                    ✕
                                </button>
                                <div className="absolute inset-x-0 bottom-0 bg-black/50 backdrop-blur-sm text-white text-[9px] text-center py-0.5 font-medium tracking-wider">
                                    SAVED
                                </div>
                            </div>
                        ))}

                        {/* Newly selected local files */}
                        {newImages.map((file, idx) => (
                            <div key={`new-${idx}`} className="relative w-28 h-28 rounded-xl overflow-hidden shadow-md border-2 border-primary/40">
                                <img src={URL.createObjectURL(file)} alt={`New ${idx + 1}`} className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveNew(idx)}
                                    className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold shadow-lg transition-all active:scale-90"
                                    title="Remove this image"
                                >
                                    ✕
                                </button>
                                <div className="absolute inset-x-0 bottom-0 bg-primary/70 backdrop-blur-sm text-white text-[9px] text-center py-0.5 font-medium tracking-wider">
                                    NEW
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Submit Button ─────────────────────────────────────── */}
            <button disabled={isLoading}
                className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary/90 transition shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? "Saving Product..." : initialValues ? "Update Product" : "Create Product"}
            </button>
        </form>
    );
};

export default ProductForm;