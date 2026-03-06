import { useNavigate } from "react-router-dom";
import { useCreateProductMutation } from "../../../features/admin/adminProductApi";
import { useToast } from "../../../context/ToastContext";
import ProductForm from "../../../components/admin/ProductForm";

const AdminCreateProductPage = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [createProduct, { isLoading }] = useCreateProductMutation();

    const handleSubmit = async (formData: FormData) => {
        try {
            await createProduct(formData).unwrap();
            showToast("Product created successfully");
            navigate("/admin/products");
        } catch (err) {
            showToast("Failed to create product", "error");
            console.error(err);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8 px-4">
                <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight">Create New Product</h1>
                <p className="text-textMuted mt-2">Fill in the details below to add a new product to your catalog.</p>
            </div>

            <div className="bg-surface p-8 rounded-3xl shadow-soft border border-divider m-4">
                <ProductForm
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
};

export default AdminCreateProductPage;