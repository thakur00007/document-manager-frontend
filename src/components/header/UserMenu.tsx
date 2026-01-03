import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon, UserCircleIcon } from "@heroicons/react/20/solid";

import { useDispatch } from "react-redux";
import { logout } from "../../store/auth/authSlice";
import { NavLink } from "react-router-dom";
import UserService from "../../services/userService";
import { toast } from "react-toastify";

function UserMenu({ userName = "" }) {
  const dispatch = useDispatch();

  function handleLogout() {
    new UserService()
      .logout()
      .then(() => {
        dispatch(logout());
      })
      .catch(() => {
        toast.error("Logout failed");
      });
  }

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md  px-3 py-2 text-sm font-semibold dark:text-gray-50 text-gray-900 shadow-sm ">
          <UserCircleIcon className="h-5 w-5 text-gray-400 " /> {userName}
          <ChevronDownIcon
            aria-hidden="true"
            className="-mr-1 h-5 w-5 text-gray-400"
          />
        </MenuButton>
      </div>

      <MenuItems
        transition
        className="absolute right-0 z-10 mt-2 me-4 min-w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
      >
        <div className="py-1">
          <MenuItem>
            <NavLink
              to="/user/update-profile"
              className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900"
            >
              Update Profile
            </NavLink>
          </MenuItem>
          <MenuItem>
            <NavLink
              to="/user/change-password"
              className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900"
            >
              Change Password
            </NavLink>
          </MenuItem>
          <MenuItem>
            <button
              onClick={() => handleLogout()}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900"
            >
              Sign out
            </button>
          </MenuItem>
        </div>
      </MenuItems>
    </Menu>
  );
}

export default UserMenu;
