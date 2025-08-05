import { useDispatch } from "react-redux";
import { logout } from "../features/users/userSlice";

const LogoutButton = () => {
    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(logout());
    };

    return <button onClick={handleLogout}>Logout</button>;
};

export default LogoutButton;
