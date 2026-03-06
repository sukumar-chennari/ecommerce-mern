import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "../../../context/ToastContext";
import {
    useGetAdminProductsQuery,
    useUpdateProductMutation,
} from "../../../features/admin/adminProductApi";
import ProductForm from "../../../components/admin/ProductForm";

const AdminUpdateProductPage = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const { data, isLoading: isQueryLoading } = useGetAdminProductsQuery({});
    const [updateProduct, { isLoading: isUpdateLoading }] = useUpdateProductMutation();

    const product = data?.products.find(
        (p: any) => p._id === productId
    );

    if (isQueryLoading) return (
        <div className="flex items-center justify-center p-20">
            <p className="animate-pulse text-textMuted font-medium">Fetching product data...</p>
        </div>
    );

    if (!product) return (
        <div className="bg-danger/10 text-danger p-6 rounded-2xl flex flex-col items-center gap-4 border border-danger/20">
            <p className="font-bold text-center">Product not found!</p>
            <button onClick={() => navigate("/admin/products")} className="bg-danger text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-danger/20 hover:bg-danger/90 transition-all">Back to Products</button>
        </div>
    );

    const handleUpdate = async (formData: FormData) => {
        try {
            await updateProduct({
                productId,
                data: formData,
            }).unwrap();

            showToast("Product updated successfully", "success");
            navigate("/admin/products");
        } catch (err) {
            showToast("Update failed", "error");
            console.error(err);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8 px-4 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight">Edit Product</h1>
                    <p className="text-textMuted mt-2">Update the product information below.</p>
                </div>
                <div className="text-xs font-bold text-gray-500 uppercase px-3 py-1 bg-surface border rounded-full shadow-sm">
                    ID: {productId}
                </div>
            </div>

            <div className="bg-surface p-8 rounded-3xl shadow-soft border border-divider m-4">
                <ProductForm
                    initialValues={product}
                    onSubmit={handleUpdate}
                    isLoading={isUpdateLoading}
                />
            </div>
        </div>
    );
};

export default AdminUpdateProductPage;