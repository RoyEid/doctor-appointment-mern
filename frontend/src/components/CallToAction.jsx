import { Link } from "react-router-dom";
import { ArrowRight, Clock, ShieldCheck } from "lucide-react";

function CallToAction() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#008e9b] via-[#07aeba] to-[#46daea] px-4 py-20 text-white sm:px-6 lg:px-8 dark:from-[#071416] dark:via-[#0b1d20] dark:to-[#0f2428]">
      <div className="pointer-events-none absolute right-[-120px] top-[-120px] h-80 w-80 rounded-full bg-white/20 blur-3xl dark:bg-[#46daea]/10" />
      <div className="pointer-events-none absolute bottom-[-140px] left-[-120px] h-96 w-96 rounded-full bg-[#003f46]/20 blur-3xl dark:bg-[#008e9b]/10" />

      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="rounded-[2rem] border border-white/20 bg-white/10 p-8 text-center shadow-[0_30px_90px_rgba(15,23,42,0.18)] backdrop-blur-xl sm:p-10 md:p-12 dark:border-[#46daea]/20 dark:bg-[#0f2428]/80 dark:shadow-[0_30px_90px_rgba(0,0,0,0.4)]">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/15 text-white shadow-lg dark:bg-[#46daea]/15 dark:text-[#46daea]">
            <ShieldCheck size={34} />
          </div>

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white dark:border-[#46daea]/25 dark:text-[#46daea]">
            <Clock size={14} />
            24/7 Medical Support
          </div>

          <h3 className="mx-auto max-w-3xl text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
            Need medical help or want to book a visit?
          </h3>

          <p className="mx-auto mt-5 max-w-2xl text-base font-medium leading-relaxed text-white/85 sm:text-lg md:text-xl dark:text-slate-300">
            Book an appointment with one of our trusted doctors and manage your
            care easily from your account.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/add-appointment"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl !bg-white px-8 py-4 text-sm font-black text-[#008e9b] shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:!bg-[#f4fbfc] hover:shadow-2xl sm:w-auto dark:!bg-[#46daea] dark:text-[#071416] dark:hover:!bg-[#7ee9f2]"
            >
              Make An Appointment
              <ArrowRight
                size={19}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

            <Link
              to="/allDoctors"
              className="inline-flex w-full items-center justify-center rounded-2xl border border-white/25 bg-white/10 px-8 py-4 text-sm font-black text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/20 sm:w-auto dark:border-[#46daea]/25 dark:bg-[#46daea]/10 dark:hover:bg-[#46daea]/20"
            >
              View Doctors
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CallToAction;
