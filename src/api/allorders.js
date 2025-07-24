import axios from "axios";
const BASE_URL = 'https://client.omsguru.com/order_api/orders'; // Replace with actual URL
const TOKEN = 'XmjqZ7nbWOyE9fwUDQRKx2g8AikI3Llv';         // Bearer Token
const OMS_CID = 310958;

// async function fetchOrdersFor10Days(startDateStr) {
//     const startDate = new Date(startDateStr); // e.g. "2025-07-10"
//     const endDate = new Date(startDate);
//     endDate.setDate(endDate.getDate() + 10); // Add 10 days

//     const startTimestamp = Math.floor(startDate.getTime() / 1000);
//     const endTimestamp = Math.floor(endDate.getTime() / 1000) - 1;

//     const params = new URLSearchParams();
//     params.append('start_order_date', startTimestamp);
//     params.append('end_order_date', endTimestamp);
//     params.append('limit', '10000'); // Optional: max records

//     try {
//         const response = await axios.post(BASE_URL, params, {
//             headers: {
//                 'Content-Type': 'application/x-www-form-urlencoded',
//                 'Authorization': `Bearer ${TOKEN}`,
//                 'Oms-Cid': OMS_CID
//             }
//         });

//         let data = response.data.data;
//         console.log(data.length)

//         // console.log('Fetched Orders:', response.data.data);
//     } catch (error) {
//         console.error('Error fetching orders:', error.response?.data || error.message);
//     }
// }

// Example usage:
async function fetchAllOrders(startDateStr, days = 10) {
    const startDate = new Date(startDateStr); // example: "2025-07-10"
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + days);

    const startTimestamp = Math.floor(startDate.getTime() / 1000);
    const endTimestamp = Math.floor(endDate.getTime() / 1000) - 1;

    let last_id = 0;
    let hasMore = true;
    let allOrders = [];

    while (hasMore) {
        const params = new URLSearchParams();
        params.append('start_order_date', startTimestamp);
        params.append('end_order_date', endTimestamp);
        params.append('limit', '100');
        params.append('last_id', last_id);

        try {
            const response = await axios.post(BASE_URL, params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Bearer ${TOKEN}`,
                    'Oms-Cid': OMS_CID,
                },
            });

            const orders = response.data?.data || [];
            if (orders.length === 0) {
                hasMore = false;
            } else {
                allOrders.push(...orders);
                last_id = orders[orders.length - 1].id;
                console.log(`Fetched ${orders.length} more orders, total: ${allOrders.length}`);
                console.log(allOrders[0]);
            }
        } catch (error) {
            console.error('Error fetching orders:', error.response?.data || error.message);
            break;
        }
    }

    console.log(`✅ Total orders fetched: ${allOrders.length}`);
    return allOrders;
}

// Example usage
fetchAllOrders('2025-07-10');
