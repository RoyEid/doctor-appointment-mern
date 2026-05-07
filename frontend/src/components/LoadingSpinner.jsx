import { HeartPulse } from "lucide-react";

function LoadingSpinner({
  text = "Loading...",
  fullScreen = false,
  compact = false,
}) {
  return (
    <div
      className={`flex items-center justify-center px-4 ${
        fullScreen ? "min-h-screen" : compact ? "py-6" : "min-h-[55vh] py-10"
      }`}
    >
      <div className="relative flex flex-col items-center justify-center text-center">
        <div className="relative mb-5 flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-[#dff8fb] dark:border-[#1f3a40]" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[#008e9b] border-r-[#46daea]" />

          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#008e9b] shadow-lg dark:bg-[#0f2428] dark:text-[#46daea]">
            <HeartPulse size={24} className="animate-pulse" />
          </div>
        </div>

        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#008e9b] dark:text-[#46daea]">
          Please wait
        </p>

        <p className="mt-2 max-w-xs text-sm font-medium text-gray-500 dark:text-slate-400">
          {text}
        </p>

        <div className="mt-5 flex items-center justify-center gap-1.5">
          <span className="h-2 w-2 animate-bounce rounded-full bg-[#008e9b]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-[#46daea] [animation-delay:120ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-[#008e9b] [animation-delay:240ms]" />
        </div>
      </div>
    </div>
  );
}

export default LoadingSpinner;
