import { useDispatch } from "react-redux";
import { register, setError } from "../features/userSlice";

const handleRegister = async (payload) => {
    try {
        const response = await fetch("https://inventorybackend-m1z8.onrender.com/api/v1/packing/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: payload
        });

        const data = await response.json();
        if (response.ok) {
            dispatch(register(data.data)); // { email, username }
        } else {
            dispatch(setError(data.message || "Registration failed"));
        }
    } catch (error) {
        dispatch(setError("Network error"));
    }
};


export default handleRegister;