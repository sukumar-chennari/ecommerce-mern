import {
    useGetAdminProductsQuery,
    useDeleteProductMutation,
} from "../../../features/admin/adminProductApi";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import AdminTable from "../components/AdminTable";
import AdminBadge from "../components/AdminBadge";
import { toast } from "react-hot-toast";

const AdminProductsPage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const navigate = useNavigate();

    const { data, isLoading } = useGetAdminProductsQuery({
        search: debouncedSearch,
        page,
        limit: 10,
    });
    const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        try {
            await deleteProduct(id).unwrap();
            toast.success("Product deleted successfully");
        } catch (err) {
            toast.error("Failed to delete product");
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-textPrimary tracking-tight">Product Catalog</h1>
                    <p className="text-sm text-textMuted mt-1">Manage inventory, prices, and product information.</p>
                </div>
                
                <button
                    onClick={() => navigate("/admin/products/create")}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-xs font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Add New Product
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <svg className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input 
                        type="text" 
                        placeholder="Search products by name or SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all shadow-sm"
                    />
                </div>
                <select className="bg-white border border-gray-200 text-xs font-bold rounded-xl px-4 py-3 outline-none shadow-sm cursor-pointer hover:border-primary/50 transition-colors min-w-[150px]">
                    <option>All Categories</option>
                    <option>Electronics</option>
                    <option>Fashion</option>
                    <option>Home</option>
                </select>
            </div>

            <AdminTable headers={["Product", "Category", "Price", "Stock", "Status", "Actions"]}>
                {data?.products?.map((product: any) => (
                    <tr key={product._id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                                    {product.images?.[0] ? (
                                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-bold text-textPrimary truncate">{product.name}</span>
                                    <span className="text-[10px] text-textMuted uppercase font-bold tracking-tighter">ID: {product._id.slice(-6).toUpperCase()}</span>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-5 text-sm text-textMuted font-medium">
                            {product.category || 'Uncategorized'}
                        </td>
                        <td className="px-6 py-5">
                            <span className="text-sm font-bold text-textPrimary">₹{product.price.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-5">
                            <span className={`text-sm font-bold ${product.stock < 10 ? 'text-danger' : 'text-textPrimary'}`}>
                                {product.stock} units
                            </span>
                        </td>
                        <td className="px-6 py-5">
                            {product.stock > 0 ? (
                                <AdminBadge type="success">In Stock</AdminBadge>
                            ) : (
                                <AdminBadge type="danger">Out of Stock</AdminBadge>
                            )}
                        </td>
                        <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => navigate(`/admin/products/update/${product._id}`)}
                                    className="p-2 text-textMuted hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                                    title="Edit Product"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => handleDelete(product._id)}
                                    className="p-2 text-textMuted hover:text-danger hover:bg-danger/5 rounded-lg transition-all"
                                    title="Delete Product"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </AdminTable>

            {data?.totalPages > 1 && (
                <div className="flex justify-center gap-2 pt-4">
                    <button 
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="px-4 py-2 text-xs font-bold text-textPrimary bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-30"
                    >
                        Previous
                    </button>
                    <div className="flex items-center px-4 text-xs font-bold text-textMuted">
                        Page {page} of {data.totalPages}
                    </div>
                    <button 
                        disabled={page === data.totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="px-4 py-2 text-xs font-bold text-textPrimary bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-30"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminProductsPage;