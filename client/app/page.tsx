import Link from 'next/link'
import { BotMessageSquare } from 'lucide-react'

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-linear-to-b from-[#1a2b1a] via-[#0e140a] to-[#06080d] text-white flex flex-col items-center justify-start py-20 px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_130%_10%,rgba(106,231,23,0.3),transparent_40%),radial-gradient(circle_at_10%_100%,rgba(30,35,80,0.25),transparent_50%)]" />

      <div className="relative z-10 flex flex-col items-center justify-start max-w-7xl text-center space-y-8">
        <div className="mb-4 bg-linear-to-br from-lime-300 to-green-500 rounded-4xl p-6 rotate-6">
          <BotMessageSquare className="w-12 h-12 text-neutral-950 rotate-3" />
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mt-6">
          <span className="bg-lime-300 text-neutral-950 px-2.5 py-1 rounded-sm inline-block">Best</span>
          <span className="text-white"> Personal</span>
          <br />
          <span className="text-lime-300">AI Assistant</span>
        </h1>

        <p className="text-[#9ca3af] text-lg max-w-2xl leading-relaxed">
          Experience the future of shopping with your<br className="hidden md:block" />
          own intelligent companion.
        </p>

        <div className="w-full sm:w-xl md:w-2xl lg:w-3xl xl:w-5xl mt-40">
          <Link
            href="/login"
            className="group w-full bg-white text-black text-lg md:text-xl font-medium py-5 px-8 rounded-full hover:bg-gray-100 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            <span>Start a new chat</span>
          </Link>
        </div>

        <div className="pt-1">
          <p className="text-[#6b7280] text-sm">
            v1.2.0 • Powered by Gemini
          </p>
        </div>
      </div>
    </main>
  );
}
