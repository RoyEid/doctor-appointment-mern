import { useEffect, useRef, useState } from "react";
import { apiConfig } from "../config/api";
import {
  Stethoscope,
  Hospital,
  FlaskConical,
  Award,
  Loader2,
} from "lucide-react";

function Stats() {
  const sectionRef = useRef(null);

  const [doctorsCount, setDoctorsCount] = useState(0);
  const [departmentsCount, setDepartmentsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [displayCounts, setDisplayCounts] = useState({
    doctors: 0,
    departments: 0,
    labs: 0,
    awards: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        const [doctorsStats, departmentsStats] = await Promise.all([
          fetch(apiConfig.getDoctorsCount),
          fetch(apiConfig.getDepartmentsCount),
        ]);

        const doctorsData = await doctorsStats.json();
        const departmentsData = await departmentsStats.json();

        setDoctorsCount(doctorsData.count || 0);
        setDepartmentsCount(departmentsData.count || 0);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    if (loading) return;

    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      {
        threshold: 0.35,
      },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, [loading, hasAnimated]);

  useEffect(() => {
    if (!hasAnimated) return;

    const duration = 1400;
    const frameRate = 20;
    const totalFrames = duration / frameRate;
    let frame = 0;

    const targets = {
      doctors: doctorsCount,
      departments: departmentsCount,
      labs: 8,
      awards: 150,
    };

    const counter = setInterval(() => {
      frame += 1;

      const progress = Math.min(frame / totalFrames, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      setDisplayCounts({
        doctors: Math.floor(targets.doctors * easedProgress),
        departments: Math.floor(targets.departments * easedProgress),
        labs: Math.floor(targets.labs * easedProgress),
        awards: Math.floor(targets.awards * easedProgress),
      });

      if (progress === 1) {
        clearInterval(counter);

        setDisplayCounts({
          doctors: targets.doctors,
          departments: targets.departments,
          labs: targets.labs,
          awards: targets.awards,
        });
      }
    }, frameRate);

    return () => clearInterval(counter);
  }, [hasAnimated, doctorsCount, departmentsCount]);

  const stats = [
    {
      icon: <Stethoscope size={40} />,
      count: displayCounts.doctors,
      label: "Doctors",
      isDynamic: true,
    },
    {
      icon: <Hospital size={40} />,
      count: displayCounts.departments,
      label: "Departments",
      isDynamic: true,
    },
    {
      icon: <FlaskConical size={40} />,
      count: displayCounts.labs,
      label: "Research Labs",
      isDynamic: false,
    },
    {
      icon: <Award size={40} />,
      count: displayCounts.awards,
      label: "Awards",
      isDynamic: false,
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="border-y border-gray-100 bg-gradient-to-br from-white via-[#f8fdfe] to-[#eefcff] py-16 dark:border-[#1f3a40] dark:from-[#071416] dark:via-[#0b1d20] dark:to-[#102b30]"
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="mb-3 inline-flex rounded-full bg-[#e8fbfd] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#008e9b] dark:bg-[#46daea]/15 dark:text-[#46daea]">
            Our Impact
          </div>

          <h2 className="text-3xl font-black text-gray-900 sm:text-4xl dark:text-white">
            Trusted Healthcare Numbers
          </h2>

          <p className="mx-auto mt-2 max-w-xl text-sm font-medium text-gray-500 dark:text-slate-400">
            A quick look at our medical team, departments, and healthcare
            achievements.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item, index) => (
            <div
              className="group flex cursor-pointer flex-col items-center justify-center space-y-4 rounded-[1.5rem] border border-gray-100 bg-white p-8 text-center shadow-[0_14px_35px_rgba(15,23,42,0.07)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#008e9b] hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)] dark:border-[#1f3a40] dark:bg-[#0f2428] dark:shadow-[0_14px_35px_rgba(0,0,0,0.25)] dark:hover:bg-[#008e9b] dark:hover:shadow-[0_24px_60px_rgba(0,0,0,0.4)]"
              key={index}
            >
              <div className="inline-block rounded-full bg-[#e8fbfd] p-4 text-[#008e9b] shadow-sm transition-colors duration-300 group-hover:bg-white/15 group-hover:text-white dark:bg-[#46daea]/15 dark:text-[#46daea] dark:group-hover:bg-white/15 dark:group-hover:text-white">
                {item.icon}
              </div>

              <div>
                <span className="flex min-h-[48px] items-center justify-center text-4xl font-black text-gray-900 transition-colors duration-300 group-hover:text-white dark:text-white">
                  {loading && item.isDynamic ? (
                    <Loader2
                      size={32}
                      className="animate-spin text-[#008e9b] group-hover:text-white dark:text-[#46daea]"
                    />
                  ) : (
                    item.count
                  )}
                </span>

                <p className="mt-1 text-sm font-black uppercase tracking-[0.14em] text-gray-500 transition-colors duration-300 group-hover:text-blue-100 dark:text-slate-400">
                  {item.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Stats;
