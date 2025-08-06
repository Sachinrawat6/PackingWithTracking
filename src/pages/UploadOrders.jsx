import React, { useState } from 'react';
import Papa from 'papaparse';
import axios from 'axios';

const OrderCSVUpload = () => {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const fileInputRef = React.useRef(null);

    const handleCSVUpload = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        setStatus(null);
        setProgress(0);
    };

    const parseAndUpload = () => {
        if (!file) return;

        setLoading(true);
        setStatus(null);
        setProgress(0);

        // Add 1 second delay before starting upload
        setTimeout(() => {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: async (results) => {
                    const parsedOrders = results.data.map((row) => ({
                        order_date: row["Order Date"]?.trim(),
                        invoice_id: row["Invoice ID"]?.trim(),
                        channel_order_id: row["Channel Order Id"]?.trim(),
                        product_sku_code: row["Product Sku Code"]?.trim(),
                        listing_sku_code: row["Listing Sku Code"]?.trim(),
                        channel_name: row["Channel Name"]?.trim(),
                        qty: parseInt(row["Qty"]),
                        shipment_tracker: row["Shipment Tracker"]?.trim(),
                        shipping_company: row["Shipping Company"]?.trim()
                    }));

                    try {
                        const res = await axios.post("https://inventorybackend-m1z8.onrender.com/api/v1/oms/orders/upload", parsedOrders, {
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            onUploadProgress: (progressEvent) => {
                                const percentCompleted = Math.round(
                                    (progressEvent.loaded * 100) / progressEvent.total
                                );
                                setProgress(percentCompleted);
                            }
                        });

                        setStatus({
                            success: true,
                            message: res.data?.message || "Orders uploaded successfully!"
                        });

                        // Clear input field after successful upload
                        setFile(null);
                        if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                        }
                    } catch (err) {
                        const message = err?.response?.data?.message || "Upload failed!";
                        setStatus({ success: false, message });
                    } finally {
                        setLoading(false);
                        setProgress(0);
                    }
                },
                error: (err) => {
                    setStatus({ success: false, message: "Failed to parse CSV: " + err.message });
                    setLoading(false);
                    setProgress(0);
                }
            });
        }, 1000); // 1 second delay
    };

    return (
        <div className="max-w-3xl mx-auto relative top-30 p-10  bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="mb-6 ">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                    Order <span className="text-red-600">CSV</span> Upload
                </h2>
                <p className="text-gray-500">Upload your order data in CSV format</p>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select CSV File
                    </label>
                    <div className="flex items-center space-x-4">
                        <label className="flex flex-col items-center px-4 py-6 bg-white rounded-lg border border-dashed border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors">
                            <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                            </svg>
                            <span className="text-sm text-gray-600">
                                {file ? file.name : 'Choose a file'}
                            </span>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv"
                                onChange={handleCSVUpload}
                                className="hidden"
                            />
                        </label>
                        {file && (
                            <button
                                onClick={() => {
                                    setFile(null);
                                    if (fileInputRef.current) {
                                        fileInputRef.current.value = '';
                                    }
                                }}
                                className="text-red-500 hover:text-red-700 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {loading && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Uploading...</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                <button
                    onClick={parseAndUpload}
                    disabled={!file || loading}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${loading || !file
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-black text-white hover:bg-gray-800'
                        }`}
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Processing...</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                            </svg>
                            <span>Upload Orders</span>
                        </>
                    )}
                </button>

                {status && (
                    <div className={`p-4 rounded-lg border ${status.success
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-red-50 border-red-200 text-red-700'
                        }`}>
                        <div className="flex items-start space-x-2">
                            {status.success ? (
                                <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            )}
                            <p className="text-sm">{status.message}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderCSVUpload;