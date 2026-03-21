export default function ContactPage() {
  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center p-8 relative overflow-hidden text-center">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-pink-400">
        Contact Me
      </h1>
      <p className="text-gray-300 text-lg md:text-xl font-light max-w-2xl leading-relaxed mb-12">
        Reach out to me securely. All incoming messages are heavily filtered and relayed through advanced NodeMailer endpoints.
      </p>
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl max-w-md w-full">
        <p className="text-gray-400 text-sm font-semibold tracking-wider uppercase">Contact Link currently disabled.</p>
      </div>
    </div>
  );
}
