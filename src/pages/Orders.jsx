import axios from 'axios';
import React, { useEffect, useState } from 'react'

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchShipmentsFromBackend = async () => {
        setLoading(true);
        try {
            const response = await axios.get("https://inventorybackend-m1z8.onrender.com/api/v1/oms/orders/all_orders");
            const data = response.data.data;
            console.log(data[0].orders);
            setOrders(data);
        } catch (error) {
            console.log("Server error :: Order fetching error :: ,", error);
            setError("Failed to fetch orders ", error.message);
        } finally {
            setLoading(false);
            setError("");
        }




    }

    useEffect(() => {
        fetchShipmentsFromBackend();
    }, []);
    return (
        <div>Orders</div>
    )
}

export default Orders