import React, { useEffect, useState } from 'react';
import saveManifestToNocoDb from '../api/saveToNocoDb';


const PackedDetails = () => {
    const [orders, setOrders] = useState([]);
    const [saving, setSaving] = useState(false);
    const [progress, setProgress] = useState(0);
    const [refresh, setRefresh] = useState(false);


    useEffect(() => {
        try {
            const stored = localStorage.getItem("orders");
            const parsed = stored ? JSON.parse(stored) : [];
            if (Array.isArray(parsed)) {
                setOrders(parsed);
            }
        } catch (err) {
            console.error("Error reading localStorage data:", err);
            setOrders([]);
        }
    }, []);


    const handleSaveManifest = async () => {
        const confirm = window.confirm("Are you sure want to save manifest?");
        if (!confirm) return

        if (!orders || !Array.isArray(orders)) return;

        setSaving(true);
        setProgress(0);

        for (let i = 0; i < orders.length; i++) {
            await saveManifestToNocoDb(orders[i]);
            setProgress(Math.round(((i + 1) / orders.length) * 100));
        }

        setSaving(false);
        setRefresh(true);
        localStorage.removeItem("orders");
        setTimeout(() => {
            setRefresh(false);
            window.location.reload();
        }, 2000);
    };

    if (refresh) {
        return (
            <div className="flex justify-center items-center h-[300px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-4 text-blue-600 font-medium text-lg">Refreshing...</span>
            </div>
        );
    }




    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mt-8">
            <div className='p-4'>
                {saving && (
                    <div className="w-full bg-gray-200 rounded-full h-4 mt-4 mb-2">
                        <div
                            className="bg-blue-600 h-4 rounded-full transition-all duration-200 ease-in-out"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                )}

                {saving && (
                    <p className="text-sm text-gray-600 mb-4">Saving... {progress}% complete</p>
                )}

            </div>
            <div className='flex justify-between px-4 items-center'>

                <h2 className="py-3 px-6  font-medium text-gray-700 text-lg mb-2">
                    Packed Orders Quantity : <span className='text-4xl font-extrabold text-red-500 rounded-full border-1 w-20 h-20  px-4'>{orders?.length}  </span> <span></span>
                </h2>
                <button
                    onClick={handleSaveManifest}
                    disabled={!orders || !Array.isArray(orders) || orders.length === 0}
                    className={`py-2 px-4 rounded-md duration-75 ease-in text-white 
        ${!orders || !Array.isArray(orders) || orders.length === 0
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-black hover:scale-[.9] duration-75 ease-in cursor-pointer'}`}
                >
                    Save Manifest
                </button>

            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr className="text-left text-gray-500 text-sm font-medium">
                            <th className="py-3 px-6">#</th>
                            <th className="py-3 px-6">Tracking ID</th>
                            <th className="py-3 px-6">SKU Codes</th>
                            <th className="py-3 px-6">Quantities</th>
                            <th className="py-3 px-6">Courrier</th>
                            <th className="py-3 px-6">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {orders.length > 0 ? (
                            orders.map((order, index) => {
                                const skuCodes = order.order_items?.map(item => item.sku_code).join(', ') || 'N/A';
                                const quantities = order.order_items?.map(item => item.qty).join(', ') || '0';
                                const formattedTime = order.timestamp
                                    ? new Date(order.timestamp).toLocaleString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })
                                    : 'N/A';

                                return (
                                    <tr key={order.shipment_tracker} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-6 text-gray-600">{index + 1}</td>
                                        <td className="py-3 px-6 font-medium text-gray-700">{order.shipment_tracker}</td>
                                        <td className="py-3 px-6 text-gray-600">{skuCodes}</td>
                                        <td className="py-3 px-6 text-gray-600">{quantities}</td>
                                        <td className="py-3 px-6 font-medium text-gray-700">{order?.courrier}</td>
                                        <td className="py-3 px-6 text-gray-600">{formattedTime}</td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="5" className="py-4 px-6 text-center text-gray-500">
                                    No packed orders found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PackedDetails;
