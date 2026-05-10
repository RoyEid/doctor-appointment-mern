import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

const ScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const { theme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const totalHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;

      if (totalHeight === 0) {
        setScrollProgress(0);
        return;
      }

      const progress = (scrollTop / totalHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    // Initial check in case page is already scrolled
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const isDark = theme === "dark";

  return (
    <div
      id="scroll-progress-bar"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: `${scrollProgress}%`,
        height: "4px",
        background: isDark
          ? "linear-gradient(to right, #46daea, #7ee9f2)"
          : "linear-gradient(to right, #008e9b, #46daea)",
        zIndex: 9999,
        transition: "width 0.15s ease-out",
        pointerEvents: "none",
        boxShadow: isDark 
          ? "0 0 10px rgba(70, 218, 234, 0.4)" 
          : "0 0 10px rgba(0, 142, 155, 0.2)",
      }}
    />
  );
};

export default ScrollProgress;
