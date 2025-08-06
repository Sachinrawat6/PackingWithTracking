import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { utils, writeFile } from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import CourrierFilter from '../components/CourrierFilter';

const Manifest = () => {
    const [manifest, setManifest] = useState([]);
    const [filteredManifest, setFilteredManifest] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [courrier, setCourrier] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const limit = 100;

    // Date and time states
    const [selectedStartDate, setSelectedStartDate] = useState('');
    const [selectedEndDate, setSelectedEndDate] = useState('');
    const [startTimeHour, setStartTimeHour] = useState(0);
    const [startTimeMinute, setStartTimeMinute] = useState(0);
    const [endTimeHour, setEndTimeHour] = useState(23);
    const [endTimeMinute, setEndTimeMinute] = useState(59);

    const fetchManifest = async (page = 1) => {
        setLoading(true);
        try {
            const offset = (page - 1) * limit;

            // Build the where condition based on date range only
            let whereCondition = '';
            if (selectedStartDate && selectedEndDate) {
                whereCondition = `((timestamp,gt,exactDate,${selectedStartDate})~and(timestamp,lt,exactDate,${selectedEndDate}))~or(timestamp,eq,exactDate,${selectedEndDate})`;
            } else if (selectedStartDate) {
                whereCondition = `(timestamp,gt,exactDate,${selectedStartDate})`;
            } else if (selectedEndDate) {
                whereCondition = `(timestamp,lt,exactDate,${selectedEndDate})`;
            }

            const options = {
                method: 'GET',
                url: 'https://app.nocodb.com/api/v2/tables/m6785gjdnn9qz5j/records',
                params: {
                    offset: offset.toString(),
                    limit: limit.toString(),
                    ...(whereCondition && { where: whereCondition }),
                    viewId: 'vw0p89q3ab1do9tk'
                },
                headers: {
                    'xc-token': '-0XAccEvsn8koGW5MKQ79LoPj07lxk_1ldqDmuv1'
                }
            };

            const response = await axios.request(options);
            setManifest(response.data.list);
            setTotalRecords(response.data.pageInfo.totalRows || response.data.list.length);
        } catch (error) {
            setError("Failed to fetch Manifest");
            console.error("API Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchManifest(currentPage);
    }, [currentPage, selectedStartDate, selectedEndDate]);

    useEffect(() => {
        if (manifest.length > 0) {
            let filtered = [...manifest];

            // Apply time range filtering only if both dates are selected
            if (selectedStartDate && selectedEndDate) {
                const startDate = new Date(selectedStartDate);
                const endDate = new Date(selectedEndDate);

                // Set the time components for start and end dates
                const startDateTime = new Date(startDate);
                startDateTime.setHours(startTimeHour, startTimeMinute, 0, 0);

                const endDateTime = new Date(endDate);
                endDateTime.setHours(endTimeHour, endTimeMinute, 59, 999);

                filtered = filtered.filter(order => {
                    if (!order.timestamp) return false;
                    const orderDate = new Date(order.timestamp);
                    return orderDate >= startDateTime && orderDate <= endDateTime;
                });
            }

            // Apply courier filter if selected
            if (courrier) {
                const courierMapping = {
                    bluedart: ['BD_CP', 'BLUEDART'],
                    delhivery: ['DELHIVERY', 'Delhivery', 'DelhiverySurface'],
                    shadowfax: ['SF', "Shadowfax"],
                    xpressbees: ['XC', 'XPRESSBEES'],
                    ecom: ['725'],
                    dtdc: ['7X'],
                    ekart: ['EK_CP'],
                    shipdelight: [],
                };

                const prefixes = courierMapping[courrier.toLowerCase()] || [];
                filtered = filtered.filter(order => {
                    if (!order.courrier) return false;
                    const orderCourier = order.courrier.toString().toLowerCase();
                    return prefixes.some(prefix =>
                        orderCourier.startsWith(prefix.toLowerCase())
                    );
                });
            }

            setFilteredManifest(filtered);
            setTotalRecords(filtered.length);
            setCurrentPage(1);
        }
    }, [manifest, selectedStartDate, selectedEndDate, startTimeHour, startTimeMinute, endTimeHour, endTimeMinute, courrier]);

    const handleStartTimeHourChange = (e) => {
        setStartTimeHour(parseInt(e.target.value));
    };

    const handleStartTimeMinuteChange = (e) => {
        setStartTimeMinute(parseInt(e.target.value));
    };

    const handleEndTimeHourChange = (e) => {
        setEndTimeHour(parseInt(e.target.value));
    };

    const handleEndTimeMinuteChange = (e) => {
        setEndTimeMinute(parseInt(e.target.value));
    };

    const handlePrevious = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage * limit < totalRecords) {
            setCurrentPage(currentPage + 1);
        }
    };

    const renderSKUs = (skus, quantities) => {
        const skuEntries = Object.entries(skus || {});

        return (
            <div className="space-y-1">
                {skuEntries.map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                        <span className="text-gray-900">{value || 'N/A'}</span>
                        <span className="text-gray-500 ml-4">
                            Qty: {quantities?.[`${key}_qty`] || 'N/A'}
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    const exportToCSV = () => {
        const maxSkus = Math.max(...filteredManifest.map(item =>
            item.sku_codes ? Object.keys(item.sku_codes).length : 0
        ));

        const headers = {};
        headers['Tracking ID'] = 'Tracking ID';
        headers['Date'] = 'Date';
        for (let i = 1; i <= maxSkus; i++) {
            headers[`SKU ${i}`] = `SKU ${i}`;
            headers[`Qty ${i}`] = `Qty ${i}`;
        }
        headers['Total Items'] = 'Total Items';

        const data = filteredManifest.map(item => {
            const rowData = {
                'Tracking ID': item.tracking_id || '',
                'Date': new Date(item.timestamp).toLocaleString()
            };

            if (item.sku_codes) {
                Object.entries(item.sku_codes).forEach(([key, value], index) => {
                    rowData[`SKU ${index + 1}`] = value || '';
                    rowData[`Qty ${index + 1}`] = item.qty?.[`${key}_qty`] || 0;
                });
            }

            const itemSkusCount = item.sku_codes ? Object.keys(item.sku_codes).length : 0;
            for (let i = itemSkusCount + 1; i <= maxSkus; i++) {
                rowData[`SKU ${i}`] = '';
                rowData[`Qty ${i}`] = '';
            }

            rowData['Total Items'] = Object.values(item.qty || {}).reduce((sum, qty) => sum + (parseInt(qty) || 0), 0);

            return rowData;
        });

        const ws = utils.json_to_sheet([headers, ...data], { header: Object.keys(headers) });
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "Manifest");
        writeFile(wb, `manifest_${selectedStartDate}_to_${selectedEndDate}.csv`);
    };

    const exportToPDF = () => {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

        const title = `${courrier} Manifest - ${selectedStartDate} ${startTimeHour}:${startTimeMinute.toString().padStart(2, '0')} to ${selectedEndDate} ${endTimeHour}:${endTimeMinute.toString().padStart(2, '0')}`;
        doc.setFontSize(16);
        doc.text(title, 14, 20);

        const courierMapping = {
            bluedart: ['BD_CP', 'BLUEDART'],
            delhivery: ['DELHIVERY', 'Delhivery', 'DelhiverySurface'],
            shadowfax: ['SF', "Shadowfax"],
            xpressbees: ['XC', 'XPRESSBEES'],
            ecom: ['725'],
            dtdc: ['7X'],
            ekart: ['EK_CP'],
            shipdelight: [],
        };

        const currentCourier = courrier?.toLowerCase();
        const prefixes = courierMapping[currentCourier] || [];

        const headers = [['Sr. No.', 'Tracking ID', 'Date']];
        const tableData = filteredManifest
            .filter((o) => {
                if (!o.tracking_id) return false;
                const orderCourier = o.courrier?.toString().toLowerCase();
                return prefixes.some(prefix => orderCourier?.startsWith(prefix?.toLowerCase()));
            })
            .map((item, index) => [
                index + 1,
                item.tracking_id || 'N/A',
                new Date(item.timestamp).toLocaleString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                })
            ]);

        if (tableData.length === 0) {
            alert(`No data found for ${courrier} Manifest.`);
            return;
        }

        autoTable(doc, {
            head: headers,
            body: tableData,
            startY: 30,
            margin: { top: 20, left: 10, right: 10 },
            styles: {
                cellPadding: 3,
                fontSize: 10,
                halign: 'center',
                valign: 'middle'
            },
            headStyles: {
                fillColor: [41, 128, 185],
                textColor: 255,
                fontStyle: 'bold'
            },
            columnStyles: {
                0: { cellWidth: 20 },
                1: { cellWidth: 80 },
                2: { cellWidth: 80 }
            },
        });

        doc.save(`manifest_${selectedStartDate}_${startTimeHour}-${startTimeMinute}_to_${selectedEndDate}_${endTimeHour}-${endTimeMinute}.pdf`);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[300px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-4 text-blue-600 font-medium text-lg">Loading manifest data...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto mt-8 p-4">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                    <button
                        onClick={() => fetchManifest(currentPage)}
                        className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-20">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-800">Shipping Manifest</h2>
                        <p className="text-gray-600 mt-1">Track all your shipments in one place</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">From Date</label>
                            <input
                                type="date"
                                value={selectedStartDate}
                                onChange={(e) => setSelectedStartDate(e.target.value)}
                                className="p-2 border border-red-400 rounded focus:border-red-400 outline-red-400"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">To Date</label>
                            <input
                                type="date"
                                value={selectedEndDate}
                                onChange={(e) => setSelectedEndDate(e.target.value)}
                                className="p-2 border border-red-400 rounded focus:border-red-400 outline-red-400"
                            />
                        </div>

                        <div className="flex gap-2">
                            <div>
                                <label className="block text-sm font-medium mb-1">Start Time</label>
                                <div className="flex gap-1">
                                    <select
                                        value={startTimeHour}
                                        onChange={handleStartTimeHourChange}
                                        className="border border-red-400 border-red-400 rounded-md px-2 py-1 outline-red-400 focus:border-red-500"
                                    >
                                        {Array.from({ length: 24 }, (_, i) => (
                                            <option key={`start-hour-${i}`} value={i}>
                                                {i.toString().padStart(2, '0')}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="self-center">:</span>
                                    <select
                                        value={startTimeMinute}
                                        onChange={handleStartTimeMinuteChange}
                                        className="border border-red-400 rounded-md border-red-400 px-2 py-1 outline-red-400 focus:border-red-500"
                                    >
                                        {Array.from({ length: 60 }, (_, i) => (
                                            <option key={`start-minute-${i}`} value={i}>
                                                {i.toString().padStart(2, '0')}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">End Time</label>
                                <div className="flex gap-1">
                                    <select
                                        value={endTimeHour}
                                        onChange={handleEndTimeHourChange}
                                        className="border border-red-400 rounded-md px-2 border-red-400 py-1 outline-red-400 focus:border-red-500"
                                    >
                                        {Array.from({ length: 24 }, (_, i) => (
                                            <option key={`end-hour-${i}`} value={i}>
                                                {i.toString().padStart(2, '0')}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="self-center">:</span>
                                    <select
                                        value={endTimeMinute}
                                        onChange={handleEndTimeMinuteChange}
                                        className="border border-red-400 rounded-md px-2 py-1 border-red-400 outline-red-400 focus:border-red-500"
                                    >
                                        {Array.from({ length: 60 }, (_, i) => (
                                            <option key={`end-minute-${i}`} value={i}>
                                                {i.toString().padStart(2, '0')}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="courrier-filter" className="block text-sm font-medium text-gray-700 mb-1">
                                Filter by Courrier
                            </label>
                            <CourrierFilter courrier={courrier} setCourrier={setCourrier} />
                        </div>

                        <div className="flex items-end gap-2">
                            <button
                                onClick={() => fetchManifest(1)}
                                className="px-4 py-2 bg-black text-white rounded hover:bg-[#222]"
                            >
                                Apply Filter
                            </button>
                            <button
                                onClick={exportToCSV}
                                className="bg-green-600 hover:bg-green-700 cursor-pointer text-white px-4 py-2 rounded-md text-sm font-medium"
                            >
                                CSV
                            </button>
                            <button
                                onClick={exportToPDF}
                                className="bg-red-600 cursor-pointer hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                            >
                                Manifest
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    #
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tracking Number
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    SKUs & Quantities
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Courrier
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total Items
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredManifest.length > 0 ? (
                                filteredManifest.map((order, i) => (
                                    <tr key={`${order.id || order.timestamp}-${i}`} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {(currentPage - 1) * limit + i + 1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {order.tracking_id || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(order.timestamp).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {renderSKUs(order.sku_codes, order.qty)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {order.courrier || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {Object.values(order.qty || {}).reduce((sum, qty) => sum + (parseInt(qty) || 0), 0)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                                        {loading ? 'Loading...' : 'No records found for selected filters'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {filteredManifest.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Showing <span className="font-medium">{(currentPage - 1) * limit + 1}</span> to{' '}
                            <span className="font-medium">
                                {Math.min(currentPage * limit, totalRecords)}
                            </span>{' '}
                            of <span className="font-medium">{totalRecords}</span> results
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={handlePrevious}
                                disabled={currentPage === 1}
                                className={`px-4 py-2 border rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                            >
                                Previous
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={currentPage * limit >= totalRecords}
                                className={`px-4 py-2 border rounded-md ${currentPage * limit >= totalRecords ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Manifest;