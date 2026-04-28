import React from "react";
import Slider from "react-slick";
import carousel_1 from "../img/hero-carousel/hero-carousel-1.jpg";

import carousel_2 from "../img/hero-carousel/hero-carousel-2.jpg";

import carousel_3 from "../img/hero-carousel/hero-carousel-3.jpg";

function HeroSlider() {
  const settings = {
    dots: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 5000,
    fade: true,
    arrows: false,
  };

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

  return (
    <section className="relative w-full h-[80vh] overflow-hidden">
      <Slider {...settings}>
        {slides.map((slide, index) => (
          <div key={index} className="relative w-full h-[80vh]">
            <img src={slide.image} className="w-full h-full object-cover" />

            <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col justify-center items-center text-center text-white px-4">
              <h2 className="text-4xl text-[#46daea] font-bold mb-4">
                {slide.title}
              </h2>

              <p className="max-w-xl text-xl ">{slide.text}</p>

              <a
                href="#about"
                className="mt-6 inline-block bg-[#46daea] text-black py-3 px-6 rounded hover:bg-[#43b0ba] transition "
              >
                Read More
              </a>
            </div>
          </div>
        ))}
      </Slider>
    </section>
  );
}

export default HeroSlider;
