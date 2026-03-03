import { useGetAdminProductsQuery } from "../../../features/admin/adminProductApi";
import { useNavigate } from "react-router-dom";

const AdminProductsPage = () => {
    const { data, isLoading } = useGetAdminProductsQuery({})
    const navigate = useNavigate();

    if (isLoading) return <p>Loading...</p>;

    const handleClick = () => {
        navigate("/admin/products/create");
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
                                <button className="text-blue-500">Edit</button>
                                <button className="text-red-500">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminProductsPage;