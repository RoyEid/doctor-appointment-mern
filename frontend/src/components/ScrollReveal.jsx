import { useEffect, useRef, useState } from "react";

function ScrollReveal({
  children,
  delay = 0,
  direction = "up",
  className = "",
}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -80px 0px",
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const getHiddenTransform = () => {
    if (direction === "down") return "-translate-y-8";
    if (direction === "left") return "translate-x-8";
    if (direction === "right") return "-translate-x-8";
    return "translate-y-8";
  };

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`w-full overflow-hidden transition-all duration-700 ease-out ${
        isVisible
          ? "translate-x-0 translate-y-0 opacity-100"
          : `${getHiddenTransform()} opacity-0`
      } ${className}`}
    >
      {children}
    </div>
  );
}

export default ScrollReveal;
