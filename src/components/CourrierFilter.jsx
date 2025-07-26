import React, { useState } from 'react'

const CourrierFilter = ({ setCourrier, courrier }) => {
    console.log(courrier)

    return (
        <div>
            <select onChange={(e) => setCourrier(e.target.value)}
                value={courrier}
                className='bg-gray-100 py-2 px-4 rounded shadow-xs cursor-pointer outline-gray-300'
            >
                <option value="">Select Courrier</option>
                <option value="Bluedart">BlueDart</option>
                <option value="Delhivery">Delhivery </option>
                <option value="Shadowfax">Shadowfax </option>
                <option value="XpressBees">XpressBees </option>
                <option value="Ekart">Ekart </option>
                <option value="Shipdelight">ShipDelight </option>
                <option value="DTDC">DTDC </option>
                <option value="ECOM">ECOM</option>
            </select>
        </div>
    )
}

export default CourrierFilter