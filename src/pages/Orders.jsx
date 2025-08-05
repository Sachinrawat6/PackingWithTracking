import axios from 'axios';
import React, { useEffect, useState } from 'react';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(25);
    const [filters, setFilters] = useState({
        shipment_tracker: '',
        channel_order_id: '',
        product_sku_code: ''
    });

    const fetchShipmentsFromBackend = async () => {
        setLoading(true);
        try {
            const response = await axios.get("https://inventorybackend-m1z8.onrender.com/api/v1/oms/orders/all_orders");
            const data = response.data.data;
            setOrders(data[0].orders);
            setFilteredOrders(data[0].orders);
        } catch (error) {
            console.log("Server error :: Order fetching error :: ", error);
            setError("Failed to fetch orders " + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShipmentsFromBackend();
    }, []);

    useEffect(() => {
        const filtered = orders.filter(order => {
            return (
                order.shipment_tracker.toLowerCase().includes(filters.shipment_tracker.toLowerCase()) &&
                order.channel_order_id.toLowerCase().includes(filters.channel_order_id.toLowerCase()) &&
                order.product_sku_code.toLowerCase().includes(filters.product_sku_code.toLowerCase())
            );
        });
        setFilteredOrders(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    }, [filters, orders]);

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className='container mx-auto p-4'>
            <h2 className='text-2xl font-bold text-red-700 mb-6 border-b-2 border-black pb-2'>All Orders</h2>

            {/* Filters */}
            <div className='bg-gray-100 p-4 rounded-lg mb-6 shadow-md'>
                <h3 className='text-lg font-semibold text-black mb-3'>Filters</h3>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Tracking Number</label>
                        <input
                            type="text"
                            name="shipment_tracker"
                            value={filters.shipment_tracker}
                            onChange={handleFilterChange}
                            className='w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500'
                            placeholder='Filter by tracking number'
                        />
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Order ID</label>
                        <input
                            type="text"
                            name="channel_order_id"
                            value={filters.channel_order_id}
                            onChange={handleFilterChange}
                            className='w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500'
                            placeholder='Filter by order ID'
                        />
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>SKU Code</label>
                        <input
                            type="text"
                            name="product_sku_code"
                            value={filters.product_sku_code}
                            onChange={handleFilterChange}
                            className='w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500'
                            placeholder='Filter by SKU code'
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className='flex justify-center items-center h-64'>
                    <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-700'></div>
                </div>
            ) : error ? (
                <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative' role='alert'>
                    <strong className='font-bold'>Error! </strong>
                    <span className='block sm:inline'>{error}</span>
                </div>
            ) : (
                <>
                    <div className='overflow-x-auto shadow-lg rounded-lg'>
                        <table className='w-full'>
                            <thead>
                                <tr className='bg-black text-white'>
                                    <th className='py-3 px-4 text-left font-medium'>#No.</th>
                                    <th className='py-3 px-4 text-left font-medium'>Channel</th>
                                    <th className='py-3 px-4 text-left font-medium'>Order Id</th>
                                    <th className='py-3 px-4 text-left font-medium'>Sku Code</th>
                                    <th className='py-3 px-4 text-left font-medium'>Quantity</th>
                                    <th className='py-3 px-4 text-left font-medium'>Tracking Number</th>
                                    <th className='py-3 px-4 text-left font-medium'>Courrier</th>
                                    <th className='py-3 px-4 text-left font-medium'>Order Date</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-200'>
                                {currentItems.length > 0 ? (
                                    currentItems.map((order, index) => (
                                        <tr
                                            key={order.shipment_tracker + index}
                                            className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-red-50 transition-colors`}
                                        >
                                            <td className='py-3 px-4'>{indexOfFirstItem + index + 1}</td>
                                            <td className='py-3 px-4'>{order.channel_name}</td>
                                            <td className='py-3 px-4 font-medium'>{order.channel_order_id}</td>
                                            <td className='py-3 px-4 text-red-700 font-medium'>{order.product_sku_code}</td>
                                            <td className='py-3 px-4'>{order.qty}</td>
                                            <td className='py-3 px-4 font-medium'>{order.shipment_tracker}</td>
                                            <td className='py-3 px-4'>{order.shipping_company}</td>
                                            <td className='py-3 px-4'>{order.order_date}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className='py-4 text-center text-gray-500'>
                                            No orders found matching your filters
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {filteredOrders.length > itemsPerPage && (
                        <div className='flex justify-between items-center mt-4'>
                            <div className='text-sm text-gray-700'>
                                Showing <span className='font-medium'>{indexOfFirstItem + 1}</span> to{' '}
                                <span className='font-medium'>
                                    {Math.min(indexOfLastItem, filteredOrders.length)}
                                </span>{' '}
                                of <span className='font-medium'>{filteredOrders.length}</span> results
                            </div>
                            <div className='flex space-x-2'>
                                <button
                                    onClick={() => {
                                        const newPage = Math.max(1, currentPage - 1);
                                        paginate(newPage);
                                    }}
                                    disabled={currentPage === 1}
                                    className={`px-4 py-2 border rounded ${currentPage === 1 ? 'bg-gray-200 cursor-not-allowed' : 'bg-white hover:bg-red-700 hover:text-white border-red-700 text-red-700'}`}
                                >
                                    Previous
                                </button>

                                {/* Always show first page */}
                                <button
                                    onClick={() => paginate(1)}
                                    className={`px-4 py-2 border rounded ${currentPage === 1 ? 'bg-red-700 text-white border-red-700' : 'bg-white hover:bg-red-50 border-red-700 text-red-700'}`}
                                >
                                    1
                                </button>

                                {/* Show ellipsis if current range doesn't start from 2 */}
                                {currentPage > 4 && (
                                    <span className="px-4 py-2">...</span>
                                )}

                                {/* Dynamic page numbers */}
                                {(() => {
                                    let startPage = Math.max(2, currentPage - 3);
                                    let endPage = Math.min(totalPages - 1, currentPage + 3);

                                    // Adjust if we're at the beginning
                                    if (currentPage <= 4) {
                                        endPage = Math.min(5, totalPages - 1);
                                    }
                                    // Adjust if we're at the end
                                    else if (currentPage >= totalPages - 3) {
                                        startPage = Math.max(totalPages - 4, 2);
                                    }

                                    const pages = [];
                                    for (let i = startPage; i <= endPage; i++) {
                                        pages.push(
                                            <button
                                                key={i}
                                                onClick={() => paginate(i)}
                                                className={`px-4 py-2 border rounded ${currentPage === i ? 'bg-red-700 text-white border-red-700' : 'bg-white hover:bg-red-50 border-red-700 text-red-700'}`}
                                            >
                                                {i}
                                            </button>
                                        );
                                    }
                                    return pages;
                                })()}

                                {/* Show ellipsis if current range doesn't end at totalPages-1 */}
                                {currentPage < totalPages - 3 && (
                                    <span className="px-4 py-2">...</span>
                                )}

                                {/* Always show last page if there is more than 1 page */}
                                {totalPages > 1 && (
                                    <button
                                        onClick={() => paginate(totalPages)}
                                        className={`px-4 py-2 border rounded ${currentPage === totalPages ? 'bg-red-700 text-white border-red-700' : 'bg-white hover:bg-red-50 border-red-700 text-red-700'}`}
                                    >
                                        {totalPages}
                                    </button>
                                )}

                                <button
                                    onClick={() => {
                                        const newPage = Math.min(totalPages, currentPage + 1);
                                        paginate(newPage);
                                    }}
                                    disabled={currentPage === totalPages}
                                    className={`px-4 py-2 border rounded ${currentPage === totalPages ? 'bg-gray-200 cursor-not-allowed' : 'bg-white hover:bg-red-700 hover:text-white border-red-700 text-red-700'}`}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Orders;