export default function HomePage() {
  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center p-8 relative overflow-hidden text-center">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-[120px] pointer-events-none" />
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-pink-400">
        Portfolio Showcase
      </h1>
      <p className="text-gray-300 text-lg md:text-xl font-light max-w-2xl leading-relaxed mb-12">
        A highly secure, architecturally advanced Next.js + NestJS platform demonstrating symmetric encryption, SMTP delivery modules, and raw binary disk processing.
      </p>
    </div>
  );
}
