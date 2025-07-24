import axios from "axios";

// Replace these with your actual values
const BASE_URL = 'https://client.omsguru.com/order_api/order_details';
const TOKEN = 'XmjqZ7nbWOyE9fwUDQRKx2g8AikI3Llv';         // Bearer Token
const OMS_CID = 310958;   // OMS Client ID
const SUB_ORDER_ID = '16402368332021';  // or use `id` or `order_id`


async function fetchOrderDetails() {
    try {
        const response = await axios.post(
            BASE_URL,
            new URLSearchParams({
                // sub_order_id: SUB_ORDER_ID
                id: 596961102
                // id: Number(SUB_ORDER_ID)
                // OR use: order_id: "..." OR id: "..."
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Bearer ${TOKEN}`,
                    'Oms-Cid': OMS_CID,
                }
            }
        );

        // console.log('Order Details:', response.data.data[0]);
        let data = response.data.data;
        // console.log('Order Details:', response.data);
        // console.log(data.length)
        // data.length = 10;
        // console.log(data.map((o) => o.order_items))
        // let matchedData = data.find((o) = o.order_items.channel_order_id == "NYK-29820764-9538039-2-1")
        // let matchedData = data.find((o) => o.channel_order_id == "NYK-29820764-9538039-2-1")
        // console.log(data.map((o) => o.order_items.find((order) => order.channel_order_id == "NYK-29820764-9538039-2-1")))
        const result = data
            .map((o) => o.order_items.find((order) => order.channel_order_id == "NYK-29820764-9538039-2-1"))
            .filter(Boolean);

        console.log(result);

    } catch (error) {
        console.error('Error fetching order details:', error.response?.data || error.message);
    }
}



fetchOrderDetails();


