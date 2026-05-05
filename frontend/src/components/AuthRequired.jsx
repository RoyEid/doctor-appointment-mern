import { Link } from "react-router-dom";
import { LockKeyhole, ArrowRight } from "lucide-react";

function AuthRequired() {
  return (
    <main className="flex min-h-[75vh] items-center justify-center bg-gradient-to-br from-[#f4fbfc] via-white to-[#eefcff] px-4 py-10">
      <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white bg-white/95 p-8 text-center shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl">
        <div className="absolute left-8 right-8 top-0 h-1 rounded-b-full bg-gradient-to-r from-[#008e9b] via-[#46daea] to-[#008e9b]" />

        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#e8fbfd] text-[#008e9b] shadow-sm">
          <LockKeyhole size={32} />
        </div>

        <div className="mb-3 inline-flex rounded-full bg-[#e8fbfd] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#008e9b]">
          Authentication Required
        </div>

        <h2 className="text-2xl font-black text-gray-900">
          Please log in first
        </h2>

        <p className="mx-auto mt-3 max-w-sm text-sm font-medium leading-relaxed text-gray-500">
          You need to be logged in before you can continue to this page.
        </p>

        <Link
          to="/login"
          className="group mt-7 inline-flex w-full items-center justify-center gap-2 rounded-2xl !bg-[#008e9b] px-6 py-4 text-sm font-black text-white shadow-lg transition-all hover:-translate-y-0.5 hover:!bg-[#007a85] hover:shadow-xl"
        >
          Go to Login
          <ArrowRight
            size={18}
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>
      </div>
    </main>
  );
}

export default AuthRequired;
