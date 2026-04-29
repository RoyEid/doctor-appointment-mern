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
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col justify-center items-center text-center text-white px-6">
              <h2 className="text-3xl md:text-5xl text-[#46daea] font-extrabold mb-4 md:mb-6 animate-fade-in-up">
                {slide.title}
              </h2>

              <p className="max-w-2xl text-lg md:text-2xl font-light mb-8 opacity-90 animate-fade-in-up animation-delay-300">
                {slide.text}
              </p>

              <a
                href="#about"
                className="inline-block bg-[#46daea] bg-opacity-90 text-black font-bold py-3 md:py-4 px-8 md:px-10 rounded-full shadow-lg hover:bg-[#43b0ba] hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
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
