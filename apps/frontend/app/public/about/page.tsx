export default function AboutPage() {
  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center p-8 relative overflow-hidden text-center">
      {/* Dynamic Backgrounds */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-[120px] pointer-events-none" />

      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-pink-400">
        About This Architecture
      </h1>
      
      <p className="text-gray-300 text-lg md:text-xl font-light max-w-2xl leading-relaxed mb-12">
        This platform represents a heavily secured and hyper-optimized engineering showcase. 
        It integrates <strong className="text-white">NestJS</strong> handling mathematically encrypted Postgres bytes, 
        and <strong className="text-white">Next.js</strong> driving physically interactive Framer Motion states. 
        Designed with zero-trust RBAC protocols to preserve data integrity and execute seamless binary storage delivery payloads.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        {['E2E Security', 'Symmetric Encryption', 'Native Binaries'].map((feature) => (
          <div key={feature} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl hover:bg-white/10 transition-colors">
            <h3 className="text-white font-bold text-xl mb-2">{feature}</h3>
            <p className="text-gray-400 text-sm font-light">
              Structurally engineered to map and secure parameters directly into the Node.js matrix logic paths.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
