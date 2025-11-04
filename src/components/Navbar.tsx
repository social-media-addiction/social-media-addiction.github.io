import { NavLink, useLocation } from "react-router-dom";

interface NavbarProps {
  isDarkMode?: boolean; // optional flag
}

function Navbar({ isDarkMode = false }: NavbarProps) {
  const location = useLocation();

  const navLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    return `btn btn-ghost ${
      isActive
        ? isDarkMode
          ? "text-teal-300 font-bold"
          : "text-primary font-bold"
        : ""
    }`;
  };

  return (
    <div
      className={`navbar shadow-sm fixed top-0 left-0 right-0 z-20 transition-colors duration-300 ${
        isDarkMode ? "bg-base-100/0. text-white" : "bg-base-200 text-black"
      }`}
    >
      <div className="navbar-start">
        <NavLink to="/" className="btn btn-ghost text-xl">
          Students' Social Media Addiction
        </NavLink>
      </div>

      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <NavLink to="/" className={() => navLinkClass("/")}>
              Introduction
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/interesting-finds"
              className={() => navLinkClass("/interesting-finds")}
            >
              Interesting Finds
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/analyze-data"
              className={() => navLinkClass("/analyze-data")}
            >
              Analyze Data
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/explore-room"
              className={() => navLinkClass("/explore-room")}
            >
              Explore Room
            </NavLink>
          </li>
        </ul>
      </div>

      <div className="navbar-end">
        <div className="flex items-center gap-4 pr-4">
          {/* Optional buttons/icons */}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
