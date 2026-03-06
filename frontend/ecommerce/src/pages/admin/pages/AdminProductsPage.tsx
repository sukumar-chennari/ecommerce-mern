import { useGetAdminProductsQuery, useDeleteProductMutation } from "../../../features/admin/adminProductApi";
import { useNavigate } from "react-router-dom";

const AdminProductsPage = () => {
    const { data, isLoading } = useGetAdminProductsQuery({})
    const [deleteProduct] = useDeleteProductMutation();
    const navigate = useNavigate();

    if (isLoading) return <p>Loading...</p>;

    const handleClick = () => {
        navigate("/admin/products/create");
    }

    const handleDelete = (productId: string) => {
        if (window.confirm("Are you sure?")) {
            deleteProduct(productId);
        }
    }
    const handleEdit = (productId: string) => {
        navigate(`/admin/products/update/${productId}`);
        console.log("product  info sending to update page is : ", data?.products.find((p: any) => p._id === productId));
    }

    return (
        <div>
            <div className="flex justify-between mb-6">
                <h1 className="text-2xl font-bold">Products</h1>
                <button className="bg-primary text-white px-4 py-2 rounded" onClick={handleClick}>
                    Add Product
                </button>
            </div>

            <table className="w-full border-collapse">
                <thead>
                    <tr className="border-b">
                        <th className="text-left py-2">Name</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {data?.products.map((product) => (
                        <tr key={product._id} className="border-b">
                            <td className="py-3">{product.name}</td>
                            <td>₹{product.price}</td>
                            <td>{product.stock}</td>
                            <td className="space-x-2">
                                <button className="text-blue-500" onClick={() => handleEdit(product._id)}>Edit</button>
                                <button className="text-red-500" onClick={() => handleDelete(product._id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminProductsPage;