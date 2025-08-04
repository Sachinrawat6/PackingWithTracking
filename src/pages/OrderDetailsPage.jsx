import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import ProductImage from '../components/ProductImage';
import PackedDetails from './PackedDetails';

const OrderDetailsPage = ({ trackingId: initialTrackingId, trackingRef }) => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [imagesLoading, setImagesLoading] = useState(true);
    const [localStorageData, setLocalStorageData] = useState([]);
    const [productsError, setProductsError] = useState(null);
    const [currentTrackingId, setCurrentTrackingId] = useState(initialTrackingId);
    const debounceTimer = useRef(null);

    // Debounce tracking ID changes
    useEffect(() => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(() => {
            setCurrentTrackingId(initialTrackingId);
        }, 300); // 300ms delay for barcode scanner input

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [initialTrackingId]);

    const saveToLocalStorage = useCallback((newOrderData) => {
        try {
            let existingOrders = [];
            const storedData = localStorage.getItem("orders");

            if (storedData) {
                try {
                    const parsedData = JSON.parse(storedData);
                    existingOrders = Array.isArray(parsedData) ? parsedData : [parsedData];
                } catch (e) {
                    console.error("Error parsing localStorage data:", e);
                    existingOrders = [];
                }
            }

            const minimalOrderData = {
                shipment_tracker: newOrderData.shipment_tracker,
                order_items: newOrderData.order_items?.map(item => ({
                    sku_code: item.sku_code,
                    qty: item.qty
                })) || [],
                timestamp: Date.now()
            };

            setLocalStorageData(minimalOrderData);

            const existingIndex = existingOrders.findIndex(
                order => order && order.shipment_tracker === newOrderData.shipment_tracker
            );

            if (existingIndex >= 0) {
                existingOrders[existingIndex] = minimalOrderData;
            } else {
                existingOrders.push(minimalOrderData);
            }

            localStorage.setItem("orders", JSON.stringify(existingOrders.slice(-50)));
        } catch (error) {
            console.error("Error saving to localStorage:", error);
        }
    }, []);
    const fetchOrderDetails = useCallback(async (trackingId) => {
        if (!trackingId) {
            setOrder(null);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setImagesLoading(true);
            setProductsError(null);

            // Clean the tracking ID
            let cleanedTrackingId = trackingId
                .replace(/[\n\r]/g, '')
                .replace(/[\u0000-\u001F]/g, '')
                .trim();
            cleanedTrackingId = trackingId

            const response = await fetch(
                `https://inventorybackend-m1z8.onrender.com/api/v1/oms/orders/shipment_tracker/${cleanedTrackingId}`
            );

            if (!response.ok) {
                const shouldSave = window.confirm("Order not found. Do you want to add this tracking ID to the manifest?");

                if (shouldSave) {
                    const dummyOrder = {
                        shipment_tracker: cleanedTrackingId,
                        order_items: [],
                        timestamp: Date.now()
                    };
                    saveToLocalStorage(dummyOrder);
                    setOrder(dummyOrder);
                }

                throw new Error(`Order not found: ${cleanedTrackingId}`);
            }

            const data = await response.json();

            if (!data.success || !data.data) {
                const shouldSave = window.confirm("Order data incomplete. Do you want to add this tracking ID to the manifest?");

                if (shouldSave) {
                    const dummyOrder = {
                        shipment_tracker: cleanedTrackingId,
                        order_items: [],
                        timestamp: Date.now()
                    };
                    saveToLocalStorage(dummyOrder);
                    setOrder(dummyOrder);
                }

                throw new Error("Order data incomplete");
            }

            // Successful case
            setOrder(data.data);
            saveToLocalStorage(data.data);

        } catch (err) {
            setError(err.message);
            if (!order) {
                setOrder(null);
            }
        } finally {
            if (trackingRef.current) {
                trackingRef.current.focus();
                trackingRef.current.select();
            }
            setLoading(false);
        }
    }, [saveToLocalStorage, trackingRef]);

    useEffect(() => {
        fetchOrderDetails(currentTrackingId);
    }, [currentTrackingId, fetchOrderDetails]);

    // const styleCodes = useMemo(() => {
    //     return order?.order_items?.map(item =>
    //         Number(item.sku_code?.split("-")[0])
    //     ) || [];
    // }, [order]);

    const styleCodes = useMemo(() => {
        return [Number(order?.product_sku_code.split("-")[0])] || [];
    }, [order]);

    const formatDate = useCallback((timestamp) => {
        if (!timestamp || timestamp === "0") return "N/A";
        return new Date(timestamp * 1000).toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }, []);

    useEffect(() => {
        const storedData = localStorage.getItem("orders");
        if (storedData) {
            try {
                const parsed = JSON.parse(storedData);
                if (Array.isArray(parsed)) {
                    setLocalStorageData(parsed);
                }
            } catch (err) {
                console.error("Failed to parse orders from localStorage", err);
            }
        }
    }, []);

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
            <>
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
                <PackedDetails />
            </>
        );
    }

    if (!order && !currentTrackingId) {
        return (
            <>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4 rounded">
                    <div className="flex items-center">
                        <svg className="h-5 w-5 text-blue-500 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                        </svg>
                        <p className="text-blue-700">Enter a tracking ID to view order details</p>
                    </div>
                </div>
                <PackedDetails />
            </>
        );
    }

    if (!order) return null;

    return (
        <div>
            <div className='grid grid-cols-4 gap-4'>
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                    <div className="flex flex-col items-start mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
                        <div className="bg-blue-100 text-blue-800 px-3 py-1 truncate rounded-full text-sm font-medium">
                            {order.channel || 'Unknown Channel'}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 mb-8">
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
                            Order Items <span className="text-gray-500">({order?.length || 1})</span>
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
                                    {/* {order?.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">
                                                    {item.sku_code || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-900 text-xl">{item.qty || '0'}</td>
                                        </tr>
                                    ))} */}
                                    {order.product_sku_code}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className='col-span-3'>
                    {imagesLoading && (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                            <span className="ml-3">Loading product images...</span>
                        </div>
                    )}
                    {productsError && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-4 rounded">
                            <div className="flex items-center">
                                <svg className="h-5 w-5 text-yellow-500 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <p className="text-yellow-700">{productsError}</p>
                            </div>
                        </div>
                    )}
                    <ProductImage
                        style_code={styleCodes}
                        onLoadComplete={() => setImagesLoading(false)}
                        onError={(error) => setProductsError(error.message || 'Failed to load product images')}
                    />
                </div>
            </div>
            <PackedDetails trackingId={currentTrackingId} />
        </div>
    );
};

export default React.memo(OrderDetailsPage);