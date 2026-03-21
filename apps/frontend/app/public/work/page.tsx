export default function WorkPage() {
  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center p-8 relative overflow-hidden text-center">
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-[120px] pointer-events-none" />
      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-pink-400">
        My Work
      </h1>
      <p className="text-gray-300 text-lg font-light max-w-2xl mb-12">
        Explore my professional timeline and architectural achievements.
      </p>
    </div>
  );
}
