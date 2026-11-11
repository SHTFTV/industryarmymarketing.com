import { useEffect, useRef, useState } from "react";

export type BlogBanner = { src: string; poster: string; label: string; credit: string; creditUrl: string };

export default function BlogVideoBanner({ banner }: { banner: BlogBanner }) {
  const ref = useRef<HTMLVideoElement>(null);
  const manuallyPaused = useRef(false);
  const [paused, setPaused] = useState(true);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const sync = () => {
      if (!visible || reduced.matches || document.hidden || manuallyPaused.current) video.pause();
      else void video.play().catch(() => {});
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: 0.15 });
    observer.observe(video);
    reduced.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => { observer.disconnect(); reduced.removeEventListener("change", sync); document.removeEventListener("visibilitychange", sync); video.pause(); };
  }, [banner.src]);
  return <figure className="my-8 overflow-hidden rounded-xl border border-[#d9ddcd] bg-[#1d382d]">
    <div className="relative h-[210px] sm:h-[240px]">
      <video ref={ref} src={banner.src} poster={banner.poster} muted loop playsInline preload="metadata" aria-label={banner.label} onPlay={() => setPaused(false)} onPause={() => setPaused(true)} className="h-full w-full object-cover" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
      <p className="pointer-events-none absolute inset-x-6 top-6 max-w-[80%] font-serif text-3xl text-[#fffdf5] sm:text-4xl">{banner.label}</p>
      <button type="button" aria-label={`${paused ? "Play" : "Pause"} ${banner.label} video`} aria-pressed={paused} className="absolute bottom-4 right-4 rounded border border-white/60 bg-black/60 px-3 py-2 text-xs text-white" onClick={() => { const video = ref.current; if (!video) return; manuallyPaused.current = !video.paused; if (video.paused) void video.play().catch(() => {}); else video.pause(); }}>{paused ? "Play video" : "Pause video"}</button>
    </div>
    <figcaption className="px-4 py-3 text-xs leading-relaxed text-[#f4ecd8]">Illustrative footage · <a className="underline" href={banner.creditUrl} target="_blank" rel="noopener noreferrer">{banner.credit}</a> · BeeGoods’ licensed collection. Not a treatment or confirmed product.</figcaption>
  </figure>;
}
