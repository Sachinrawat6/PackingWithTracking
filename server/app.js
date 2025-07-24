const fs = require('fs');
const path = require('path');

const DATA_FILE_PATH = path.join(__dirname, 'orders_data.json');

// Ensure data directory exists
const ensureDataFileExists = () => {
    try {
        if (!fs.existsSync(DATA_FILE_PATH)) {
            fs.writeFileSync(DATA_FILE_PATH, JSON.stringify({ orders: [], lastUpdated: null }), 'utf8');
            console.log('Created new orders data file');
        }
    } catch (err) {
        console.error('Error creating data file:', err);
    }
};

// Call this when server starts
ensureDataFileExists();

// Modified saveDataToFile function with better error handling
function saveDataToFile(data) {
    try {
        const fileData = {
            orders: data,
            lastUpdated: new Date().toISOString()
        };
        fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(fileData, null, 2), 'utf8');
        console.log('Successfully saved data to file');
        return true;
    } catch (err) {
        console.error('Error saving to file:', err);
        return false;
    }
}

// Modified /orders endpoint
app.get("/orders", async (req, res) => {
    try {
        const startDate = req.query.startDate || format(subDays(new Date(), 1), 'yyyy-MM-dd');
        const days = parseInt(req.query.days) || 1;
        const refresh = req.query.refresh === 'true';

        let allOrders;

        if (!refresh) {
            try {
                const fileData = readDataFromFile();
                if (fileData.orders && fileData.orders.length > 0) {
                    console.log("Serving orders from cache file");
                    return res.json({
                        total: fileData.orders.length,
                        orders: fileData.orders,
                        lastUpdated: fileData.lastUpdated,
                        message: `Serving ${fileData.orders.length} orders from cache`
                    });
                }
            } catch (cacheError) {
                console.log("Cache read failed, fetching fresh data");
            }
        }

        // Fetch fresh data
        const dateList = getDateList(startDate, days);
        console.log("Fetching fresh orders for dates:", dateList);
        allOrders = await processDatesInParallel(dateList);

        // Save to file and verify
        const saveSuccess = saveDataToFile(allOrders);
        if (!saveSuccess) {
            console.warn("Data fetched but failed to save to file");
        }

        res.json({
            total: allOrders.length,
            orders: allOrders,
            lastUpdated: new Date().toISOString(),
            message: `Successfully fetched ${allOrders.length} orders` +
                (saveSuccess ? '' : ' (but failed to save to cache)')
        });
    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({
            error: true,
            message: err.message
        });
    }
});