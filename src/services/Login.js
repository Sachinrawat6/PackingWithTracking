import { useDispatch } from "react-redux";
import { login } from "../features/users/userSlice";


const handleLogin = async (payload) => {
    try {
        const response = await fetch("https://inventorybackend-m1z8.onrender.com/api/v1/packing/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: payload,
        });

        const data = await response.json();
        if (response.ok) {
            dispatch(login(data.data)); // { email, username }
        } else {
            dispatch(setError(data.message || "Login failed"));
        }
    } catch (error) {
        dispatch(setError("Network error"));
    }
};


export default handleLogin;