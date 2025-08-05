import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { utils, writeFile } from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import CourrierFilter from '../components/CourrierFilter';

const Manifest = () => {
    const [manifest, setManifest] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [courrier, setCourrier] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const limit = 100;

    const fetchManifest = async (page = 1, date = selectedDate) => {
        setLoading(true);
        try {
            const offset = (page - 1) * limit;
            const options = {
                method: 'GET',
                url: 'https://app.nocodb.com/api/v2/tables/m6785gjdnn9qz5j/records',
                params: {
                    offset: offset.toString(),
                    limit: limit.toString(),
                    where: `(timestamp,eq,exactDate,${date})`,
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
    }

    useEffect(() => {
        fetchManifest(currentPage);
    }, [currentPage, selectedDate]);

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
        setCurrentPage(1); // Reset to first page when date changes
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

    // Corrected export functions
    const exportToCSV = () => {
        // First, find the maximum number of SKUs in any item to determine columns needed
        const maxSkus = Math.max(...manifest.map(item =>
            item.sku_codes ? Object.keys(item.sku_codes).length : 0
        ));

        // Prepare headers
        const headers = {};
        headers['Tracking ID'] = 'Tracking ID';
        headers['Date'] = 'Date';
        for (let i = 1; i <= maxSkus; i++) {
            headers[`SKU ${i}`] = `SKU ${i}`;
            headers[`Qty ${i}`] = `Qty ${i}`;
        }
        headers['Total Items'] = 'Total Items';

        // Prepare data rows
        const data = manifest.map(item => {
            const rowData = {
                'Tracking ID': item.tracking_id || '',
                'Date': new Date(item.timestamp).toLocaleString()
            };

            // Add SKUs and quantities to separate columns
            if (item.sku_codes) {
                Object.entries(item.sku_codes).forEach(([key, value], index) => {
                    rowData[`SKU ${index + 1}`] = value || '';
                    rowData[`Qty ${index + 1}`] = item.qty?.[`${key}_qty`] || 0;
                });
            }

            // Fill empty columns if item has fewer SKUs than max
            const itemSkusCount = item.sku_codes ? Object.keys(item.sku_codes).length : 0;
            for (let i = itemSkusCount + 1; i <= maxSkus; i++) {
                rowData[`SKU ${i}`] = '';
                rowData[`Qty ${i}`] = '';
            }

            // Add total items
            rowData['Total Items'] = Object.values(item.qty || {}).reduce((sum, qty) => sum + (parseInt(qty) || 0), 0);

            return rowData;
        });

        // Create worksheet with headers
        const ws = utils.json_to_sheet([headers, ...data], { header: Object.keys(headers) });

        // Create workbook and export
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "Manifest");
        writeFile(wb, `manifest_${selectedDate}.csv`);
    };



    // const exportToPDF = () => {
    //     const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' }); // A4 = 210mm x 297mm

    //     const title = `Shipping Manifest - ${selectedDate}`;

    //     // Add title
    //     doc.setFontSize(16);
    //     doc.text(title, 14, 20);

    //     // courrier mapping 
    //     const courrierMapping = {
    //         bluedart: ['77'],
    //         delhivery: ['284', '345', '2379', '195'],
    //         shadowfax: ['SF'],
    //         xpressbees: ['1411', '1413', '136'],
    //         ecom: ['725'],
    //         dtdc: ['7X'],
    //         ekart: ['CLQ'],
    //         shipdelight: [],

    //     }

    //     // Table headers and data
    //     const headers = [['Sr. No.', 'Tracking ID', 'Date']];
    //     const tableData = manifest
    //         .filter((o) => o.tracking_id === courrierMapping[courrier?.toLowerCase().some((match) => o.tracking_id?.toString().startsWithh(match))])
    //         .map((item, index) => [
    //             index + 1,
    //             item.tracking_id || 'N/A',
    //             new Date(item.timestamp).toLocaleString('en-IN', {
    //                 year: 'numeric',
    //                 month: 'short',
    //                 day: '2-digit',
    //                 hour: '2-digit',
    //                 minute: '2-digit',
    //             })
    //         ]);

    //     autoTable(doc, {
    //         head: headers,
    //         body: tableData,
    //         startY: 30,
    //         margin: { top: 20, left: 10, right: 10 },
    //         styles: {
    //             cellPadding: 3,
    //             fontSize: 10,
    //             halign: 'center',
    //             valign: 'middle'
    //         },
    //         headStyles: {
    //             fillColor: [41, 128, 185],
    //             textColor: 255,
    //             fontStyle: 'bold'
    //         },
    //         columnStyles: {
    //             0: { cellWidth: 20 },  // Sr. No.
    //             1: { cellWidth: 80 },  // Tracking ID
    //             2: { cellWidth: 80 }   // Date
    //         },
    //         didDrawPage: (data) => {
    //             // Optional: Add page footer or header on each page if needed
    //         }
    //     });

    //     doc.save(`manifest_${selectedDate}.pdf`);
    // };
    const exportToPDF = () => {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' }); // A4 = 210mm x 297mm

        const title = `${courrier} Manifest - ${selectedDate}`;

        // Add title
        doc.setFontSize(16);
        doc.text(title, 14, 20);



        const courierMapping = {
            bluedart: ['BD_CP', 'BLUEDART'],
            delhivery: ['DELHIVERY', 'Delhivery', 'DelhiverySurface', 'Nykaa Fashion', 'Nykaa Fashion Exchange Reverse'],
            shadowfax: ['SF', "Shadowfax"],
            xpressbees: ['XC', 'XPRESSBEES'],
            ecom: ['725'],
            dtdc: ['7X'],
            ekart: ['EK_CP'],
            shipdelight: [],
        };

        // Get the current courier's prefixes
        const currentCourier = courrier?.toLowerCase();
        const prefixes = courierMapping[currentCourier] || [];



        // Table headers and data
        const headers = [['Sr. No.', 'Tracking ID', 'Date']];
        const tableData = manifest
            .filter((o) => {
                if (!o.tracking_id) return false;
                const orderCourier = o.courrier?.toString().toLowerCase(); // lowercase
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
            alert(`No data found for generate ${courrier} Manifest.`)
            return
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
                0: { cellWidth: 20 },  // Sr. No.
                1: { cellWidth: 80 },  // Tracking ID
                2: { cellWidth: 80 }   // Date
            },
            didDrawPage: (data) => {
                // Optional: Add page footer or header on each page if needed
            }
        });

        doc.save(`manifest_${selectedDate}.pdf`);
    };


    if (loading) {
        return (
            <div className="flex justify-center items-center h-[300px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-4 text-blue-600 font-medium text-lg">Loading manifest for {selectedDate}</span>
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
        <div className="container mx-auto px-4 py-8">

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-800">Shipping Manifest</h2>
                        <p className="text-gray-600 mt-1">Track all your shipments in one place</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-4">
                        <div>
                            <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 mb-1">
                                Filter by Date
                            </label>
                            <input
                                type="date"
                                id="date-filter"
                                value={selectedDate}
                                onChange={handleDateChange}
                                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* courrier filter  */}
                        <div>
                            <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 mb-1">
                                Filter by Courrier
                            </label>
                            <CourrierFilter courrier={courrier} setCourrier={setCourrier} />
                        </div>

                        <div className="flex items-end gap-2">
                            <button
                                onClick={exportToCSV}
                                className="bg-green-600 hover:bg-green-700 cursor-pointer text-white px-4 py-2 rounded-md text-sm font-medium"
                            >
                                Export CSV
                            </button>
                            <button
                                onClick={exportToPDF}
                                className="bg-red-600 cursor-pointer hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                            >
                                Export Manifest
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
                            {manifest.length > 0 ? (
                                manifest.map((order, i) => (
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
                                        <td className="px-6 py-4">
                                            {order?.courrier}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {Object.values(order.qty || {}).reduce((sum, qty) => sum + (parseInt(qty) || 0), 0)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                                        No records found for selected date
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {manifest.length > 0 && (
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
}

export default Manifest;