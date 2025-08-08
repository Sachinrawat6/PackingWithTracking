import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { utils, writeFile } from 'xlsx';

const Tag = () => {
    const [tracking, setTracking] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const trackingRef = useRef();
    const [localstorageData, setLocalStorageData] = useState([]);
    const [mrpAndTitle, setMrpAndTitle] = useState([]);

    // Load data from localStorage on component mount
    useEffect(() => {
        const savedData = localStorage.getItem("order");
        if (savedData) {
            try {
                setLocalStorageData(JSON.parse(savedData));
            } catch (e) {
                console.error("Error parsing localStorage data:", e);
                localStorage.removeItem("orders");
            }
        }
    }, []);

    const fetchMrpAndTitle = async () => {
        try {
            const response = await axios.get(`https://inventorybackend-m1z8.onrender.com/api/product`)
            const data = response.data;
            setMrpAndTitle(data);
            console.log(data);
        } catch (error) {
            setError(error.response?.data?.message || error.message || "Failed to fetch color and title data");
        }
    }

    useEffect(() => {
        fetchMrpAndTitle();
    }, []);


    const fetchTrackingData = async (e) => {
        e?.preventDefault();
        if (!tracking.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(
                `https://inventorybackend-m1z8.onrender.com/api/v1/oms/orders/shipment_tracker/${tracking}`
            );

            const data = response.data.data;
            if (!data || data.length === 0) {
                throw new Error("No data found for this tracking ID");
            }

            // Prepare new data to be saved
            const newData = data.map(item => ({
                product_sku_code: item.product_sku_code || 'N/A',
                qty: item.qty || 0,
                added_time: new Date().toLocaleString(),
                tracking_id: tracking,
                // Add additional fields needed for export

            }));

            // Update localStorage with new data
            const updatedData = [...newData, ...localstorageData];
            localStorage.setItem("order", JSON.stringify(updatedData));
            setLocalStorageData(updatedData);

            // Reset input and focus
            setTracking("");
            if (trackingRef.current) {
                trackingRef.current.focus();
                trackingRef.current.select();
            }

        } catch (error) {
            setError(error.response?.data?.message || error.message || "Failed to fetch tracking data");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            fetchTrackingData();
        }
    };

    const getMrpAndStyleName = (data) => {
        const matchedProduct = mrpAndTitle.find((p) => p.style_code === Number(data));
        return {
            mrp: matchedProduct?.mrp,
            title: matchedProduct?.style_name,
        }
    }

    const exportToCSV = () => {
        if (localstorageData.length === 0) {
            alert("No data to export");
            return;
        }



        // Prepare data in the required format
        const csvData = localstorageData.map(item => (
            // const matchedProduct = mrpAndTitle.find((p)=>p.style_code === )
            {

                'Label Type': '50 mm x 25 mm on Roll - PDF',
                'Sku Code': item?.product_sku_code,
                'Sku Name': getMrpAndStyleName(item?.product_sku_code.split("-")[0]).title || "Qurvii Product",
                'Brand': 'Qurvii',
                'Color': item?.product_sku_code?.split("-")[1],
                'Size': item?.product_sku_code?.split("-")[2],
                'Unit': '1 Pcs',
                'MRP': getMrpAndStyleName(item?.product_sku_code.split("-")[0]).mrp || "NA",
                'Qty': item.qty,
                'Custom Text': 'MFG & MKT BY: Qurvii. 2nd Floor. B149. Sector 6. Noida. UP. 201301'
            }));

        // Create worksheet
        const ws = utils.json_to_sheet(csvData);

        // Create workbook
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "Labels");

        // Export to CSV
        writeFile(wb, `Qurvii_Labels_${new Date().toISOString().split('T')[0]}.csv`);
    };

    return (
        <div className='py-20 container mx-auto px-4'>
            <h2 className='text-red-500 font-medium text-xl'>Tag Generation</h2>

            <form onSubmit={fetchTrackingData} className="mb-8">
                <input
                    ref={trackingRef}
                    className='border mt-4 py-2 px-4 rounded-md border-1 border-red-400 w-full outline-red-500 cursor-pointer'
                    type="text"
                    onChange={(e) => setTracking(e.target.value)}
                    onKeyDown={handleKeyDown}
                    value={tracking}
                    placeholder='Scan Tracking Id | Invoice Id'
                    autoFocus
                />
                <div className="flex gap-2 mt-2">
                    <button
                        type="submit"
                        className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
                        disabled={loading}
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                    <button
                        type="button"
                        onClick={exportToCSV}
                        className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                        disabled={localstorageData.length === 0}
                    >
                        Export CSV
                    </button>
                </div>
            </form>

            {loading && (
                <p className='py-4 text-center animate-pulse text-red-400'>Loading...</p>
            )}

            {error && (
                <p className='py-4 text-center text-red-500'>{error}</p>
            )}

            {localstorageData.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className='w-full mt-6 border-collapse'>
                        <thead>
                            <tr className='bg-red-100'>
                                <th className='py-3 px-4 font-medium text-left'>#</th>
                                <th className='py-3 px-4 font-medium text-left'>Tracking ID</th>
                                <th className='py-3 px-4 font-medium text-left'>SKU Code</th>
                                <th className='py-3 px-4 font-medium text-left'>Qty</th>
                                <th className='py-3 px-4 font-medium text-left'>Added At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {localstorageData.map((order, index) => (
                                <tr
                                    key={`${order.tracking_id}-${index}`}
                                    className='border-b border-gray-200 hover:bg-gray-50'
                                >
                                    <td className='py-3 px-4'>{index + 1}</td>
                                    <td className='py-3 px-4'>{order.tracking_id || 'N/A'}</td>
                                    <td className='py-3 px-4'>{order.product_sku_code}</td>
                                    <td className='py-3 px-4'>{order.qty}</td>
                                    <td className='py-3 px-4'>{order.added_time}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className='py-10 text-center text-gray-500'>No orders scanned yet</p>
            )}
        </div>
    );
};

export default Tag;