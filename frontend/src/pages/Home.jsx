import CallToAction from "../components/CallToAction";
import HeroSlider from "../components/HeroSlider";
import About from "../components/About";
import Stats from "../components/Stats";
import Departments from "../components/Departments";
import Doctors from "../components/Doctors";
import ScrollReveal from "../components/ScrollReveal";

function Home() {
  return (
    <div>
      <HeroSlider />

      <ScrollReveal delay={100}>
        <CallToAction />
      </ScrollReveal>

      <ScrollReveal delay={100}>
        <About />
      </ScrollReveal>

      <ScrollReveal delay={100}>
        <Stats />
      </ScrollReveal>

      <ScrollReveal delay={100}>
        <Departments />
      </ScrollReveal>

      <ScrollReveal delay={100}>
        <Doctors />
      </ScrollReveal>
    </div>
  );
}

export default Home;