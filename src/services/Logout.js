import { useDispatch } from "react-redux";
import { logout } from "../features/users/userSlice";

const handleLogout = () => {
    dispatch(logout());
};

export default handleLogout;