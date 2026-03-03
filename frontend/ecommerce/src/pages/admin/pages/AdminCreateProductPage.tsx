import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateProductMutation } from "../../../features/admin/adminProductApi";
import { useToast } from "../../../context/ToastContext";

const AdminCreateProductPage = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [createProduct, { isLoading }] = useCreateProductMutation();

    const [form, setForm] = useState({
        name: "",
        description: "",
        price: "",
        category: "",
        brand: "",
        stock: "",
    });

    const [images, setImages] = useState<FileList | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const formData = new FormData();

            Object.entries(form).forEach(([key, value]) => {
                formData.append(key, value);
            });

            if (images) {
                Array.from(images).forEach((file) => {
                    formData.append("images", file);
                });
            }

            await createProduct(formData).unwrap();

            showToast("Product created successfully");
            navigate("/admin/products");

        } catch (err) {
            showToast("Failed to create product", "error");
        }
    };

    return (
        <div className="max-w-2xl">
            <h1 className="text-2xl font-bold mb-6">Create Product</h1>

            <form onSubmit={handleSubmit} className="space-y-4">

                <input
                    name="name"
                    placeholder="Product Name"
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                    required
                />

                <textarea
                    name="description"
                    placeholder="Description"
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                    required
                />

                <input
                    type="number"
                    name="price"
                    placeholder="Price"
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                    required
                />

                <input
                    name="category"
                    placeholder="Category"
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                    required
                />

                <input
                    name="brand"
                    placeholder="Brand"
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                    required
                />

                <input
                    type="number"
                    name="stock"
                    placeholder="Stock"
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                    required
                />

                <input
                    type="file"
                    multiple
                    onChange={(e) => setImages(e.target.files)}
                    className="w-full"
                />

                <button
                    disabled={isLoading}
                    className="bg-primary text-white px-6 py-2 rounded disabled:opacity-50"
                >
                    {isLoading ? "Creating..." : "Create Product"}
                </button>

            </form>
        </div>
    );
};

export default AdminCreateProductPage;