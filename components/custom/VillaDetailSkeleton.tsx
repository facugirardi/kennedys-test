import Navbar from '@/components/custom/Navbar';
import Footer from '@/components/custom/footerNew';

type VillaDetailSkeletonProps = {
  isRealEstate?: boolean;
};

export default function VillaDetailSkeleton({ isRealEstate = false }: VillaDetailSkeletonProps) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-white">
      <Navbar textBlack className="fixed md:absolute top-0 left-0 w-full z-40 bg-white md:bg-transparent" />
      <main className="flex-1 relative" role="status" aria-live="polite">
        <span className="sr-only">Loading property…</span>
        <section className="relative pt-28 md:pt-32">
          <div className="relative h-[min(70vh,520px)] md:max-[1919px]:h-[min(72vh,800px)] md:min-[1920px]:h-[min(67vh,760px)] shrink-0">
            <div
              className="absolute inset-0 bg-gradient-to-b from-[#e8eaee] to-[#dfe4ea] animate-pulse"
              aria-hidden
            />
            <div className="absolute bottom-6 left-4 md:left-8 z-20 flex gap-3" aria-hidden>
              <div className="h-10 w-[7.5rem] rounded-sm bg-white/85 shadow-sm" />
              <div className="h-10 w-[7.5rem] rounded-sm bg-white/85 shadow-sm" />
            </div>
            <div
              className={`absolute top-1/2 -translate-y-1/2 z-20 pointer-events-none ${
                isRealEstate
                  ? 'right-2 md:right-5 w-[calc(100%-2rem)] max-w-[26rem] md:w-[26rem] p-2 md:p-3'
                  : 'right-4 md:right-8 w-[calc(100%-2rem)] md:w-96 max-w-sm p-2.5 md:p-6'
              }`}
              aria-hidden
            >
              <div
                className={`w-full bg-white/95 shadow-[0_22px_48px_-12px_rgba(23,35,56,0.12)] ring-1 ring-[#172338]/[0.06] animate-pulse ${
                  isRealEstate ? 'min-h-[22rem] md:min-h-[26rem]' : 'min-h-[18rem] md:min-h-[20rem]'
                }`}
              />
            </div>
          </div>
        </section>

        <div className="relative z-10 px-4 md:px-32 w-full flex flex-col items-center text-center bg-white py-10 md:py-14">
          <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-3 md:gap-4">
            <div className="h-9 md:h-11 w-[88%] max-w-2xl rounded-sm bg-[#e8eaee] animate-pulse" />
            <div className="h-5 w-40 md:w-48 rounded-sm bg-[#eef2f6] animate-pulse" />
            <div className="mt-2 h-4 w-full max-w-3xl rounded-sm bg-[#f0f2f5] animate-pulse" />
            <div className="h-4 w-full max-w-3xl rounded-sm bg-[#f0f2f5] animate-pulse" />
            <div className="h-4 w-[72%] max-w-xl rounded-sm bg-[#f0f2f5] animate-pulse" />
          </div>
        </div>

        <div className="px-4 md:px-32 pb-14 max-w-[1600px] mx-auto w-full">
          <div className="h-56 md:h-72 w-full bg-[#e8eaee] animate-pulse" />
        </div>

        <div className="px-4 md:px-32 pb-16 max-w-[1600px] mx-auto w-full">
          <div className="h-8 w-64 mx-auto mb-8 rounded-sm bg-[#e8eaee] animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex flex-col gap-4 border border-[#a3a3a3] py-[22px] px-[23px] bg-white"
              >
                <div className="h-[240px] w-full bg-[#eef2f6] animate-pulse" />
                <div className="h-7 w-4/5 max-w-[280px] bg-[#e8eaee] animate-pulse" />
                <div className="h-4 w-32 bg-[#f0f2f5] animate-pulse" />
                <div className="h-4 w-44 bg-[#f0f2f5] animate-pulse" />
                <div className="h-5 w-24 bg-[#e8eaee] animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer disableTravelSection={isRealEstate} />
    </div>
  );
}
