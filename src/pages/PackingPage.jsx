import React, { useRef, useState } from 'react'
import OrderDetailsPage from './OrderDetailsPage'
import ProductImage from '../components/ProductImage'

const PackingPage = () => {
  const [trackingId, setTrackingId] = useState("");
  const trackingRef = useRef(null);

  return (
    <div className='container mx-auto p-4 gap-4 mt-4'>
      <div>
        <h2 className='text-xl font-semibold text-gray-700 mb-4'>Order Packing</h2>
        <input
          type="text"
          onChange={(e) => setTrackingId(e.target.value)}
          value={trackingId}
          ref={trackingRef}
          placeholder='Enter Tracking Id...'
          className='bg-gray-200 p-3 w-full outline-gray-300 cursor-pointer rounded-md shadow-xs'
        />
        <div className='mt-4'>
          <OrderDetailsPage trackingId={trackingId} trackingRef={trackingRef} />
        </div>
      </div>


    </div>
  );
};

export default PackingPage;
