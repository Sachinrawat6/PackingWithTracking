import React, { useEffect, useState, useMemo, useCallback } from 'react';

const ProductImage = React.memo(({ style_code = [], onLoadComplete }) => {
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [error, setError] = useState("");
    const [cachedProducts, setCachedProducts] = useState({});

    // Memoize the fetch function to prevent unnecessary recreations
    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            // First check if we have all requested products in cache
            const uncachedStyleCodes = style_code.filter(code => !cachedProducts[code]);

            if (uncachedStyleCodes.length === 0) {
                // All products are already cached, no need to fetch
                return;
            }

            const response = await fetch("https://inventorybackend-m1z8.onrender.com/api/product");
            if (!response.ok) throw new Error("Network response was not ok");

            const result = await response.json();

            // Update cache with new products
            const newCache = { ...cachedProducts };
            result.forEach(product => {
                newCache[product.style_code] = product;
            });
            setCachedProducts(newCache);

            setProducts(result);
        } catch (error) {
            setError("Failed to fetch products");
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
            onLoadComplete?.();
        }
    }, [style_code, cachedProducts, onLoadComplete]);

    useEffect(() => {
        if (style_code.length > 0) {
            fetchProducts();
        }
    }, [style_code, fetchProducts]);

    // Memoize the matched products calculation
    const matchedProducts = useMemo(() => {
        return style_code
            .map(code => cachedProducts[code])
            .filter(Boolean); // Remove undefined values
    }, [style_code, cachedProducts]);

    // Determine grid columns based on matched products count
    const gridClass = useMemo(() => {
        return matchedProducts.length > 1 ? "grid-cols-3" : "grid-cols-1";
    }, [matchedProducts.length]);

    return (
        <div className={`grid gap-5 ${gridClass}`}>
            {loading && (
                <div className="flex justify-center items-center col-span-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    <span className="ml-2">Loading products...</span>
                </div>
            )}

            {error && (
                <p className="text-red-500 col-span-full">{error}</p>
            )}

            {!loading && matchedProducts.length === 0 && (
                <p className="col-span-full">No matching products found.</p>
            )}

            {matchedProducts.map((item) => (
                <div key={item.style_id} className='overflow-hidden'>
                    <iframe
                        src={`https://www.myntra.com/tunics/qurvii/qurvii-shirt-collar-striped-tunic/${item.style_id}/buy`}
                        width="100%"
                        height={600}
                        title={`Product ${item.style_id}`}
                        className="rounded shadow-md -mt-40"
                        loading="lazy"
                        onLoad={() => {
                            // You could add additional loading state handling here if needed
                        }}
                    />
                </div>
            ))}
        </div>
    );
});

export default ProductImage;