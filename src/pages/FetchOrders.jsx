import React, { useState, useEffect, useCallback } from 'react';
import { format, subDays, addDays, isAfter, isBefore } from 'date-fns';

const OrderFetcher = () => {
  const today = new Date();
  const [startDate, setStartDate] = useState(format(subDays(today, 1), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(today, 'yyyy-MM-dd'));
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState('');
  const [channelFilter, setChannelFilter] = useState('');
  const [uniqueChannels, setUniqueChannels] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [fetchProgress, setFetchProgress] = useState(0);

  const fetchOrders = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      setFetchProgress(10);

      if (forceRefresh) {
        setOrders([]);
        setFilteredOrders([]);
      }

      const diffTime = Math.abs(new Date(endDate) - new Date(startDate));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      // First request to trigger data fetch
      const fetchResponse = await fetch(
        `https://inventorybackend-m1z8.onrender.com/api/v1/oms/orders/fetch-orders`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            startDate: startDate,
            endDate: endDate
          })
        }
      );

      setFetchProgress(50);

      if (!fetchResponse.ok) {
        throw new Error(`Server returned ${fetchResponse.status}`);
      }

      // Second request to get the actual data
      const ordersResponse = await fetch('https://inventorybackend-m1z8.onrender.com/api/v1/oms/orders/orders');
      if (!ordersResponse.ok) {
        throw new Error('Failed to fetch orders data');
      }

      const ordersData = await ordersResponse.json();
      const newOrders = ordersData.data || [];
      console.log(newOrders)

      setOrders(prevOrders => forceRefresh ? newOrders : [...prevOrders, ...newOrders]);

      // Extract unique channels
      const channels = [...new Set(newOrders.map(order => order.channel || 'Unknown'))];
      setUniqueChannels(prev => [...new Set([...prev, ...channels])]);

      setError({
        type: 'success',
        message: `Successfully fetched ${newOrders.length} orders`
      });

      setFetchProgress(100);
      setTimeout(() => setFetchProgress(0), 1000);

    } catch (err) {
      setError({
        type: 'error',
        message: err.message || 'Failed to fetch orders'
      });
      setFetchProgress(0);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  const handleRefresh = () => {
    fetchOrders(true);
  };

  useEffect(() => {
    let result = orders;

    // Apply filters
    if (dateFilter) {
      result = result.filter(order => {
        if (!order.order_date) return false;
        const orderDate = new Date(order.order_date * 1000);
        return format(orderDate, 'yyyy-MM-dd') === dateFilter;
      });
    }

    if (channelFilter) {
      result = result.filter(order => {
        const channel = order.channel || 'Unknown';
        return channel.toLowerCase() === channelFilter.toLowerCase();
      });
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order => {
        return (
          (order.shipment_tracker?.toLowerCase().includes(query)) ||
          (order.order_items?.some(item =>
            item.sku_code?.toLowerCase().includes(query) ||
            item.status?.toLowerCase().includes(query)
          ))
        );
      });
    }

    // Filter for packed items
    result = result.filter(order => {
      const items = order.order_items || [];
      // return items.some(item => {
      //   const status = item?.status?.toLowerCase() || '';
      //   return status.includes('packed');
      // });
      return items;
    });

    setFilteredOrders(result);
  }, [orders, dateFilter, channelFilter, searchQuery]);

  const handleDateChange = (e, type) => {
    const value = e.target.value;
    const newDate = new Date(value);
    const today = new Date();

    // Validate date range
    if (type === 'start') {
      if (isAfter(newDate, new Date(endDate))) {
        setError({
          type: 'error',
          message: 'Start date cannot be after end date'
        });
        return;
      }
      if (isAfter(newDate, today)) {
        setError({
          type: 'error',
          message: 'Start date cannot be in the future'
        });
        return;
      }
      setStartDate(value);
    } else {
      if (isBefore(newDate, new Date(startDate))) {
        setError({
          type: 'error',
          message: 'End date cannot be before start date'
        });
        return;
      }
      if (isAfter(newDate, today)) {
        setError({
          type: 'error',
          message: 'End date cannot be in the future'
        });
        return;
      }
      setEndDate(value);
    }
    setError(null);
  };

  const adjustDate = (days) => {
    const newStartDate = new Date(startDate);
    const newEndDate = new Date(endDate);

    newStartDate.setDate(newStartDate.getDate() + days);
    newEndDate.setDate(newEndDate.getDate() + days);

    // Don't allow dates in the future
    const today = new Date();
    if (newStartDate > today || newEndDate > today) {
      setError({
        type: 'error',
        message: 'Cannot navigate to future dates'
      });
      return;
    }

    setStartDate(format(newStartDate, 'yyyy-MM-dd'));
    setEndDate(format(newEndDate, 'yyyy-MM-dd'));
    setError(null);
  };

  const resetFilters = () => {
    setDateFilter('');
    setChannelFilter('');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Progress Bar */}
        {fetchProgress > 0 && fetchProgress < 100 && (
          <div className="w-full mb-4">
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                    Loading
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-blue-600">
                    {Math.round(fetchProgress)}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                <div
                  style={{ width: `${fetchProgress}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-300"
                ></div>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Order Management System</h1>
          <p className="mt-2 text-lg text-gray-600">View and manage packed orders</p>
        </div>

        {/* Date Controls */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <button
              onClick={() => adjustDate(-1)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700 transition-colors"
              disabled={loading}
            >
              ← Previous Day
            </button>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex flex-col">
                <label htmlFor="startDate" className="text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => handleDateChange(e, 'start')}
                  max={endDate}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="endDate" className="text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => handleDateChange(e, 'end')}
                  min={startDate}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              onClick={() => adjustDate(1)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700 transition-colors"
              disabled={loading}
            >
              Next Day →
            </button>
          </div>

          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={fetchOrders}
              disabled={loading}
              className={`px-6 py-3 rounded-md text-white font-medium ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} transition-colors`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Fetching Orders...
                </span>
              ) : (
                'Fetch Orders'
              )}
            </button>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-md text-white font-medium transition-colors"
            >
              Force Refresh
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className={`border-l-4 p-4 mb-6 ${error.type === 'error'
            ? 'bg-red-50 border-red-400'
            : error.type === 'info'
              ? 'bg-blue-50 border-blue-400'
              : 'bg-green-50 border-green-400'
            }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {error.type === 'error' ? (
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm ${error.type === 'error'
                  ? 'text-red-700'
                  : error.type === 'info'
                    ? 'text-blue-700'
                    : 'text-green-700'
                  }`}>
                  {error.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Summary and Filters */}
        {orders.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Showing {filteredOrders.length} of {orders.length} orders
              </h2>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex flex-col">
                  <label htmlFor="dateFilter" className="text-sm font-medium text-gray-700 mb-1">
                    Filter by Date
                  </label>
                  <input
                    type="date"
                    id="dateFilter"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    min={startDate}
                    max={endDate}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="channelFilter" className="text-sm font-medium text-gray-700 mb-1">
                    Filter by Channel
                  </label>
                  <select
                    id="channelFilter"
                    value={channelFilter}
                    onChange={(e) => setChannelFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Channels</option>
                    {uniqueChannels.map(channel => (
                      <option key={channel} value={channel}>{channel}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col">
                  <label htmlFor="searchQuery" className="text-sm font-medium text-gray-700 mb-1">
                    Search
                  </label>
                  <input
                    type="text"
                    id="searchQuery"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Track ID or SKU"
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700 transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>

            <p className="text-gray-600">
              Between <span className="font-semibold">{startDate}</span> and{' '}
              <span className="font-semibold">{endDate}</span>
            </p>
          </div>
        )}

        {/* Orders Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {loading && orders.length === 0 ? (
            <div className="flex justify-center items-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tracking Id
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Channel
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sku Code
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order, i) => {
                    const tracker = order.shipment_tracker || `N/A-${i}`;
                    const channel = order.channel || "NA";
                    const orderDate = order.order_date
                      ? new Date(order.order_date * 1000).toLocaleString("en-US", {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })
                      : 'N/A';

                    const firstItem = order.order_items?.[0] || {};

                    return (
                      <tr key={`${tracker}-${i}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {tracker}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {orderDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {channel}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {firstItem.sku_code || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {firstItem.qty || '0'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : (firstItem.status?.toLowerCase() || '').includes("cancelled")
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {firstItem.status || 'Unknown'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center p-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {orders.length > 0 ? 'No orders match your filters' : 'No orders'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {error ? 'Error occurred while fetching orders' : 'Select a date range and click "Fetch Orders"'}
              </p>
              {orders.length > 0 && (
                <button
                  onClick={resetFilters}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white transition-colors"
                >
                  Reset Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderFetcher;