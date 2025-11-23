import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

interface NavbarProps {
  isDarkMode?: boolean;
}

function Navbar({}: NavbarProps) {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    return `btn btn-ghost hover:bg-transparent ${
      isActive
        ? "text-teal-400 font-bold"
        : "text-white"
    }`;
  };

  return (
    <div
      className={`
        fixed top-4 left-1/2 -translate-x-1/2 z-30 shadow-lg
        transition-all duration-300 rounded-2xl backdrop-blur-xl px-2
        ${isScrolled ? "bg-black/40" : "bg-black/20"}
      `}
    >
      <div className="navbar px-4 py-2">
        
        <div className="navbar-start lg:hidden">
          <button
            className="btn btn-ghost text-white text-2xl"
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            ☰
          </button>
        </div>

        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1">
            <li><NavLink to="/" className={() => navLinkClass("/")}>Introduction</NavLink></li>
            <li><NavLink to="/interesting-finds" className={() => navLinkClass("/interesting-finds")}>Interesting Finds</NavLink></li>
            <li><NavLink to="/analyze-data" className={() => navLinkClass("/analyze-data")}>Analyze Data</NavLink></li>
            <li><NavLink to="/explore-room" className={() => navLinkClass("/explore-room")}>Explore Room</NavLink></li>
          </ul>
        </div>

        <div className="navbar-end hidden lg:flex">
          <div className="flex items-center gap-4 pr-2"></div>
        </div>
      </div>

      {isMenuOpen && (
        <div
          className="
            lg:hidden mt-2 py-3 px-4 rounded-2xl shadow-lg bg-black/40 backdrop-blur-xl
            animate-fade-in flex flex-col gap-2
          "
        >
          <NavLink
            to="/"
            className={navLinkClass("/")}
            onClick={() => setIsMenuOpen(false)}
          >
            Introduction
          </NavLink>
          <NavLink
            to="/interesting-finds"
            className={navLinkClass("/interesting-finds")}
            onClick={() => setIsMenuOpen(false)}
          >
            Interesting Finds
          </NavLink>
          <NavLink
            to="/analyze-data"
            className={navLinkClass("/analyze-data")}
            onClick={() => setIsMenuOpen(false)}
          >
            Analyze Data
          </NavLink>
          <NavLink
            to="/explore-room"
            className={navLinkClass("/explore-room")}
            onClick={() => setIsMenuOpen(false)}
          >
            Explore Room
          </NavLink>
        </div>
      )}
    </div>
  );
}

export default Navbar;
