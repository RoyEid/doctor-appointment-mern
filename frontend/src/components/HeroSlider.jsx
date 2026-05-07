import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";

import carousel_1 from "../img/hero-carousel/hero-carousel-1.jpg";
import carousel_2 from "../img/hero-carousel/hero-carousel-2.jpg";
import carousel_3 from "../img/hero-carousel/hero-carousel-3.jpg";

function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const slides = [
    {
      image: carousel_1,
      title: "Your Health, Our Priority",
      text: "We provide advanced medical care with experienced doctors, modern technology, and a caring approach for every patient.",
    },
    {
      image: carousel_2,
      title: "Specialized Medical Services",
      text: "From cardiology to pediatrics, our expert teams are ready to help you and your family stay healthy and safe.",
    },
    {
      image: carousel_3,
      title: "Easy Online Appointments",
      text: "Book your appointment quickly and conveniently with top doctors at your preferred time.",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative h-[82vh] min-h-[560px] w-full overflow-hidden bg-gray-950 sm:h-[86vh]">
      {/* Soft background glow */}
      <div className="pointer-events-none absolute right-[-120px] top-[-120px] z-20 h-96 w-96 rounded-full bg-[#46daea]/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-140px] left-[-140px] z-20 h-96 w-96 rounded-full bg-[#008e9b]/20 blur-3xl" />

      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 h-full w-full transition-all duration-1000 ease-in-out ${
            index === currentIndex
              ? "z-10 scale-100 opacity-100"
              : "z-0 scale-105 opacity-0"
          }`}
          aria-hidden={index !== currentIndex}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/55 to-[#008e9b]/35 dark:from-black/85 dark:via-black/70 dark:to-[#008e9b]/25" />

          <div className="absolute inset-0 flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center text-white">
              <div className="mb-5 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#bdf8ff] backdrop-blur-md">
                MediCare Appointment System
              </div>

              <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                {slide.title.split(",")[0]}
                {slide.title.includes(",") && (
                  <>
                    ,{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#46daea] to-[#bdf8ff]">
                      {slide.title.split(",").slice(1).join(",").trim()}
                    </span>
                  </>
                )}
              </h1>

              {!slide.title.includes(",") && (
                <div className="mx-auto mt-4 h-1.5 w-24 rounded-full bg-[#46daea]" />
              )}

              <p className="mx-auto mt-6 max-w-2xl text-base font-medium leading-relaxed text-white/85 sm:text-lg md:text-xl">
                {slide.text}
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a
                  href="#about"
                  tabIndex={index === currentIndex ? 0 : -1}
                  className="group inline-flex items-center justify-center gap-2 rounded-2xl !bg-[#008e9b] px-8 py-4 text-sm font-black text-white shadow-2xl shadow-[#008e9b]/25 transition-all duration-300 hover:-translate-y-0.5 hover:!bg-[#007a85] hover:shadow-[#008e9b]/35"
                >
                  Read More
                  <ArrowRight
                    size={19}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </a>

                <a
                  href="#services"
                  tabIndex={index === currentIndex ? 0 : -1}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-8 py-4 text-sm font-black text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/20"
                >
                  Explore Departments
                </a>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Pagination dots */}
      <div className="absolute bottom-8 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setCurrentIndex(index)}
            className={`!border-none !p-0 !shadow-none transition-all duration-300 hover:!bg-white ${
              index === currentIndex
                ? "h-3 w-9 rounded-full !bg-[#46daea]"
                : "h-3 w-3 rounded-full !bg-white/60"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 h-28 bg-gradient-to-t from-[#f4fbfc] to-transparent dark:from-[#071416]" />
    </section>
  );
}

export default HeroSlider;
