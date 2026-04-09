import { ShieldCheck, Lock, Zap } from "lucide-react";

export default function TrustSection() {
  const features = [
    {
      icon: ShieldCheck,
      title: "100% Private & Secure",
      description: "Your files never leave your device. All processing happens locally in your browser using WebAssembly and Javascript.",
    },
    {
      icon: Zap,
      title: "Lightning Fast API",
      description: "Skip the upload delays. Local processing means zero network latency when manipulating large PDF documents.",
    },
    {
      icon: Lock,
      title: "No Data Retention",
      description: "We don't have a backend storage system for your PDFs. Once you close the tab, your data is gone forever.",
    },
  ];

  return (
    <section className="py-14 md:py-20 border-y border-white/[0.04] bg-[#0a0a14]">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center text-center lg:text-left">
          
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium mb-6">
               <ShieldCheck className="w-3.5 h-3.5" /> Client-Side Processing
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight mb-6 font-display">
              Your files never leave <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">
                your device.
              </span>
            </h2>
            <p className="text-white/50 text-base md:text-lg leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
              Unlike traditional PDF tools that require you to upload sensitive documents to their servers, PDFly runs entirely in your browser. This guarantees absolute privacy and makes operations significantly faster.
            </p>
            
            <div className="space-y-4 max-w-lg mx-auto lg:mx-0">
              {features.map((feature, i) => (
                <div key={i} className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                  <div className="mt-1 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5 mx-auto sm:mx-0">
                    <feature.icon className="w-5 h-5 text-white/70" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1 text-sm">{feature.title}</h4>
                    <p className="text-xs text-white/40 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative order-1 lg:order-2 mb-10 lg:mb-0">
             {/* Security Graphic / Abstract visualization */}
             <div className="aspect-square max-w-[280px] sm:max-w-[300px] mx-auto rounded-full bg-gradient-to-tr from-purple-900/40 to-indigo-900/40 border border-white/10 flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-full border border-white/5 scale-110" />
                <div className="absolute inset-0 rounded-full border border-white/5 scale-125" />
                <div className="absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500/10 to-transparent" />
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#090912] border border-white/10 shadow-2xl flex flex-col items-center justify-center gap-2 z-10">
                   <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-green-400" />
                   <span className="text-[10px] sm:text-xs font-semibold text-white/60 tracking-widest uppercase">Secure</span>
                </div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}
