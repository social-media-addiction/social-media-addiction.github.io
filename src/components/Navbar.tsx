import { NavLink, useLocation } from "react-router-dom";

function Navbar() {
  const main_path = "/VI/";
  const location = useLocation();

  const navLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    return `btn btn-ghost ${isActive ? "text-primary font-bold" : ""}`;
  };

  return (
    <div className="navbar bg-base-200 shadow-sm z-12 fixed top-0 left-0 right-0">
      <div className="navbar-start">
        {/* <img src={} className="h-8 w-8 ml-5" /> */}
        <NavLink to={main_path} className="btn btn-ghost text-xl">
          Students' Social Media Addiction
        </NavLink>
      </div>

      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <NavLink to={main_path} className={() => navLinkClass(main_path)}>
              Introduction
            </NavLink>
          </li>
          <li>
            <NavLink
              to={`${main_path}interesting-finds`}
              className={() => navLinkClass(`${main_path}interesting-finds`)}
            >
              Interesting Finds
            </NavLink>
          </li>
          <li>
            <NavLink
              to={`${main_path}analyze-data`}
              className={() => navLinkClass(`${main_path}analyze-data`)}
            >
              Analyze Data
            </NavLink>
          </li>
          <li>
            <NavLink
              to={`${main_path}explore-room`}
              className={() => navLinkClass(`${main_path}explore-room`)}
            >
              Explore Room
            </NavLink>
          </li>
        </ul>
      </div>

      <div className="navbar-end">
        <div className="flex items-center gap-4 pr-4">
          {/* Add buttons/icons here if needed */}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
