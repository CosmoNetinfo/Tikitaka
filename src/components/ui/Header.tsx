import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 py-4 px-6 shadow-sm">
      <div className="max-w-lg mx-auto flex justify-center items-center">
        <Link href="/" className="text-2xl font-black tracking-tighter text-[#14213D]">
          TIKI TAKA
        </Link>
      </div>
    </header>
  );
}
