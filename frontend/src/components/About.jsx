import AboutUs from "../img/about.jpg";

function About() {
  return (
    <section
      id="about"
      className="bg-gradient-to-br from-[#f4fbfc] via-white to-[#eefcff] py-20 dark:from-[#071416] dark:via-[#0b1d20] dark:to-[#102b30]"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 text-center">
          <div className="mb-4 inline-flex rounded-full bg-[#e8fbfd] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#008e9b] dark:bg-[#46daea]/15 dark:text-[#46daea]">
            About MediCare
          </div>

          <h2 className="text-3xl font-black tracking-tight text-gray-900 md:text-5xl dark:text-white">
            About <span className="text-[#008e9b] dark:text-[#46daea]">Us</span>
          </h2>

          <div className="mx-auto my-6 h-1.5 w-24 rounded-full bg-[#008e9b] dark:bg-[#46daea]" />

          <p className="mx-auto max-w-2xl text-lg font-medium leading-relaxed text-gray-500 dark:text-slate-400">
            We are dedicated to providing high-quality healthcare services with
            experienced doctors, modern facilities, and compassionate care.
          </p>
        </div>

        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="group relative overflow-hidden rounded-[2rem] border border-white bg-white shadow-[0_24px_70px_rgba(15,23,42,0.12)] dark:border-[#1f3a40] dark:bg-[#0f2428] dark:shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
            <img
              src={AboutUs}
              alt="About MediCare"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <a
                href="https://www.youtube.com/watch?v=Y7f98aduVJ8"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-[#008e9b] shadow-2xl transition-transform hover:scale-110 dark:bg-[#0f2428] dark:text-[#46daea]"
                aria-label="Watch video"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-9 w-9"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white bg-white/90 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8 dark:border-[#1f3a40] dark:bg-[#0f2428]/90 dark:shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
            <h3 className="text-2xl font-black leading-tight text-gray-900 lg:text-3xl dark:text-white">
              Trusted healthcare services with skilled professionals and
              advanced technology.
            </h3>

            <div className="my-7 rounded-3xl border border-[#008e9b]/10 bg-[#e8fbfd] p-6 dark:border-[#46daea]/15 dark:bg-[#46daea]/10">
              <p className="font-semibold italic leading-relaxed text-[#007a85] dark:text-[#46daea]">
                "We strive to deliver exceptional healthcare with a patient-first
                approach, combining expert medical knowledge, modern facilities,
                and compassionate care to improve lives."
              </p>
            </div>

            <ul className="space-y-4 text-gray-700 dark:text-slate-200">
              {[
                "Quick and easy online appointment booking.",
                "Comprehensive healthcare services for your entire family.",
                "Compassionate care focused on your well-being.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#e8fbfd] text-sm font-black text-[#008e9b] dark:bg-[#46daea]/15 dark:text-[#46daea]">
                    ✓
                  </span>
                  <span className="font-semibold leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;