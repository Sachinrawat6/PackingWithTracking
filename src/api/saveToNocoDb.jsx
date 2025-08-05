import axios from 'axios';

const saveManifestToNocoDb = async (data) => {
    if (!data || !Array.isArray(data.order_items)) {
        console.warn("Invalid data passed to saveManifestToNocoDb");
        return;
    }

    // Extract SKU codes and quantities
    const sku_codes = {};
    const qty = {};

    data.order_items.forEach((item, index) => {
        sku_codes[`sku${index + 1}`] = item.sku_code || `SKU${index + 1}`;
        qty[`sku${index + 1}_qty`] = Number(item.qty) || 0;
    });

    const payload = {
        tracking_id: data.shipment_tracker || "dummy",
        sku_codes,
        qty,
        courrier: data?.courrier,
        timestamp: new Date(data.timestamp).toISOString() || new Date().toISOString()
    };

    const options = {
        method: 'POST',
        url: 'https://app.nocodb.com/api/v2/tables/m6785gjdnn9qz5j/records',
        headers: {
            'xc-token': '-0XAccEvsn8koGW5MKQ79LoPj07lxk_1ldqDmuv1',
            'Content-Type': 'application/json'
        },
        data: payload
    };

    try {
        const response = await axios.request(options);
        console.log("Saved successfully to NocoDB:", response.data);
    } catch (error) {
        console.error("Failed to save manifest", error.response?.data || error.message);
    }
};

export default saveManifestToNocoDb;
