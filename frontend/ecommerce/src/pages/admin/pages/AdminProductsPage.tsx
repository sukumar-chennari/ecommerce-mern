import {
    useGetAdminProductsQuery,
    useDeleteProductMutation,
} from "../../../features/admin/adminProductApi";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

const AdminProductsPage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [search, setSearch] = useState("")
    const [stockFilter, setStockFilter] = useState("")
    const [categoryFilter, setCategoryFilter] = useState("")
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

    const [page, setPage] = useState(1);

    const { data, isLoading, isError } = useGetAdminProductsQuery({
        search: debouncedSearchTerm,
        stock: stockFilter,
        category: categoryFilter,
        page,
        limit: 10,
    });
    const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();


    const toggleSelect = (productId: string) => {
        console.log(productId);
        setSelectedProducts((prev: any) =>
            prev.includes(productId)
                ? prev.filter((id: any) => id !== productId)
                : [...prev, productId]
        );
        console.log('selected products', selectedProducts);
    };
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    }
    // debounced search effect
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const filteredProducts = useMemo(() => {
        if (!debouncedSearchTerm) return data?.products || [];

        return data?.products?.filter((product: any) =>
            product.name
                .toLowerCase()
                .includes(debouncedSearchTerm.toLowerCase())
        ) || [];
    }, [data?.products, debouncedSearchTerm]);




    const navigate = useNavigate();

    const handleDelete = async (productId: string) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this product?"
        );

        if (!confirmDelete) return;

        try {
            await deleteProduct(productId).unwrap();
        } catch (err) {
            alert("Failed to delete product");
        }
    };
    const handleBulkDelete = async () => {
        if (!window.confirm("Delete selected products?")) return;

        await Promise.all(
            selectedProducts.map((id) => deleteProduct(id))
        );

        setSelectedProducts([]);
    };

    if (isLoading) {
        return <p className="text-gray-500">Loading products...</p>;
    }

    if (isError) {
        return <p className="text-red-500">Failed to load products</p>;
    }





    return (
        <div>
            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Products</h1>

                {/* serach bar  */}
                <div className="flex items-center gap-2">
                    <input type="text" placeholder="Search products" className="border rounded-lg px-4 py-2" onChange={(e) => handleInputChange(e)} />
                    {/* <button className="bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90">Search</button> */}
                </div>

                {selectedProducts.length > 2 && (
                    <div className="bg-gray-100 p-3 mb-4 rounded flex justify-between">
                        <span>{selectedProducts.length} selected</span>

                        <button
                            onClick={handleBulkDelete}
                            className="text-red-600"
                        >
                            Delete Selected
                        </button>
                    </div>
                )}
                <button
                    onClick={() => navigate("/admin/products/create")}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90"
                >
                    + Add Product
                </button>
            </div>


            <div className="flex gap-4 mb-6">

                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search products..."
                    className="border px-3 py-2 rounded"
                />

                <select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
                    className="border px-3 py-2 rounded"
                >
                    <option value="">All Stock</option>
                    <option value="in">In Stock</option>
                    <option value="low">Low Stock</option>
                    <option value="out">Out of Stock</option>
                </select>

                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="border px-3 py-2 rounded"
                >
                    <option value="">All Categories</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Electronics">Electronics</option>
                </select>

            </div>
            {/* EMPTY STATE */}
            {filteredProducts?.length === 0 ? (
                <p className="text-gray-500">No products found</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border rounded-xl overflow-hidden">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3">
                                    <input
                                        type="checkbox"
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedProducts(filteredProducts.map((p: any) => p._id));
                                            } else {
                                                setSelectedProducts([]);
                                            }
                                        }}
                                    />
                                </th>
                                <th className="text-left p-3">Image</th>
                                <th className="text-left p-3">Name</th>
                                <th className="p-3">Price</th>
                                <th className="p-3">Stock</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredProducts.map((product: any) => {
                                const isOutOfStock = product.stock === 0;

                                return (
                                    <tr key={product._id} className="border-t">
                                        <td className="p-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedProducts.includes(product._id)}
                                                onChange={() => toggleSelect(product._id)}
                                            />
                                        </td>
                                        {/* IMAGE */}
                                        <td className="p-3">
                                            <img
                                                src={product.images?.[0]}
                                                alt={product.name}
                                                className="w-12 h-12 object-cover rounded"
                                            />
                                        </td>

                                        {/* NAME */}
                                        <td className="p-3 font-medium">{product.name}</td>

                                        {/* PRICE */}
                                        <td className="p-3 text-center">₹{product.price}</td>

                                        {/* STOCK */}
                                        <td className="p-3 text-center">{product.stock}</td>

                                        {/* STATUS */}
                                        <td className="p-3 text-center">
                                            {isOutOfStock ? (
                                                <span className="text-red-500 text-sm font-medium">
                                                    Out of Stock
                                                </span>
                                            ) : product.stock <= 5 ? (
                                                <span className="text-orange-500 text-sm font-medium">
                                                    Low Stock
                                                </span>
                                            ) : (
                                                <span className="text-green-600 text-sm font-medium">
                                                    In Stock
                                                </span>
                                            )}
                                        </td>

                                        {/* ACTIONS */}
                                        <td className="p-3 text-center space-x-3">
                                            <button
                                                onClick={() =>
                                                    navigate(`/admin/products/update/${product._id}`)
                                                }
                                                className="text-blue-600 hover:underline"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                disabled={isDeleting}
                                                onClick={() => handleDelete(product._id)}
                                                className="text-red-600 hover:underline disabled:opacity-50"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* pagination  */}
            <div className="flex justify-center mt-6">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                >
                    Previous
                </button>
                <span className="px-4 py-2">Page {page}</span>
                <button
                    disabled={page === data?.totalPages}
                    onClick={() => setPage(page + 1)}
                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default AdminProductsPage;