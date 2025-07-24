// const TOKEN = 'XmjqZ7nbWOyE9fwUDQRKx2g8AikI3Llv';         // Bearer Token
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const app = express();

const BASE_URL = 'https://client.omsguru.com/order_api/orders';
const OMS_CID = 310958;
const TOKEN = 'XmjqZ7nbWOyE9fwUDQRKx2g8AikI3Llv';
const CONCURRENT_REQUESTS = 5; // Number of parallel requests

app.use(cors());
app.use(express.urlencoded({ extended: true }));

async function fetchOrdersForDateRange(dateStr, lastId = 0, accumulatedOrders = []) {
    const startDate = new Date(dateStr);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    const startTimestamp = Math.floor(startDate.getTime() / 1000);
    const endTimestamp = Math.floor(endDate.getTime() / 1000) - 1;

    const params = new URLSearchParams();
    params.append("start_order_date", startTimestamp);
    params.append("end_order_date", endTimestamp);
    params.append("limit", "100");
    params.append("last_id", lastId);

    try {
        const response = await axios.post(BASE_URL, params, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Bearer ${TOKEN}`,
                "Oms-Cid": OMS_CID,
            },
            timeout: 10000 // 10 seconds timeout
        });

        const orders = response.data?.data || [];

        if (orders.length > 0) {
            accumulatedOrders.push(...orders);
            // Immediately fetch next batch without delay
            return fetchOrdersForDateRange(dateStr, orders[orders.length - 1].id, accumulatedOrders);
        }

        return accumulatedOrders;
    } catch (error) {
        console.error(`Error fetching orders for ${dateStr}:`, error.response?.data || error.message);
        return accumulatedOrders; // Return whatever we've accumulated so far
    }
}

function getDateList(startDateStr, days) {
    const dates = [];
    const start = new Date(startDateStr);
    for (let i = 0; i < days; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        dates.push(d.toISOString().split("T")[0]);
    }
    return dates;
}

async function processDatesInParallel(dates) {
    const batches = [];

    // Process dates in parallel batches
    for (let i = 0; i < dates.length; i += CONCURRENT_REQUESTS) {
        const batch = dates.slice(i, i + CONCURRENT_REQUESTS);
        const batchPromises = batch.map(date => fetchOrdersForDateRange(date));
        const batchResults = await Promise.all(batchPromises);
        batches.push(...batchResults.flat());
    }

    return batches.flat();
}

app.get("/orders", async (req, res) => {
    try {
        const startDate = req.query.startDate || "2025-07-22";
        const days = parseInt(req.query.days) || 1;

        const dateList = getDateList(startDate, days);


        console.log("🚀 Fetching orders for dates:", dateList);
        const allOrders = await processDatesInParallel(dateList);

        res.json({
            total: allOrders.length,
            orders: allOrders,
            message: `Successfully fetched ${allOrders.length} orders`
        });
    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({
            error: true,
            message: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

app.listen(3000, () => {
    console.log("✅ Server running on http://localhost:3000");
});