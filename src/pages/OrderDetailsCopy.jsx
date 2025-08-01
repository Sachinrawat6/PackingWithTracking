import React, { useState, useEffect, useRef } from 'react';
import ProductImage from '../components/ProductImage';

const OrderDetailsPage = ({ trackingId, trackingRef }) => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);


    const fetchOrderDetails = async () => {


        if (!trackingId) {
            setOrder(null);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`http://localhost:3000/orders/tracking/${trackingId}`);

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();

            if (!data.success || !data.order) {
                throw new Error('Order not found');
            }

            setOrder(data.order);
        } catch (err) {
            setError(err.message);
            setOrder(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchOrderDetails();
            trackingRef.current.focus();
            trackingRef.current.select();
        }, 500);

        return () => clearTimeout(timer);
    }, [trackingId]);

    const formatDate = (timestamp) => {
        if (!timestamp || timestamp === "0") return "N/A";
        return new Date(timestamp * 1000).toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-3">Loading order details...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4 rounded">
                <div className="flex items-center">
                    <svg className="h-5 w-5 text-red-500 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div>
                        <p className="font-medium text-red-700">Error loading order</p>
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!order && !trackingId) {
        return (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4 rounded">
                <div className="flex items-center">
                    <svg className="h-5 w-5 text-blue-500 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                    </svg>
                    <p className="text-blue-700">Enter a tracking ID to view order details</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return null;
    }

    return (
        <div className='grid grid-cols-4 gap-4'>
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="flex flex-col items-start mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
                    <div className="bg-blue-100 text-blue-800 px-3 py-1 truncate rounded-full text-sm font-medium">
                        {order.channel || 'Unknown Channel'}
                    </div>
                </div>

                <div className="grid grid-cols-1  gap-6 mb-8">
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-gray-700">Tracking Information</h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Tracking ID</p>
                                    <p className="font-medium text-blue-600">{order.shipment_tracker || 'N/A'}</p>
                                </div>

                            </div>
                        </div>
                    </div>


                </div>

                <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                        Order Items <span className="text-gray-500">({order.order_items?.length || 0})</span>
                    </h3>

                    <div className="overflow-hidden border border-gray-200 rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>

                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {order.order_items?.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">
                                                {item.sku_code || 'N/A'}

                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-900 text-xl">{item.qty || '0'}</td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div className='col-span-3'>

                <ProductImage style_code={order.order_items?.map((item) => Number(item.sku_code?.split("-")[0]))} />
            </div>
        </div>
    );
};

export default OrderDetailsPage;