import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 py-3 px-6 shadow-sm">
      <div className="max-w-lg mx-auto flex justify-center items-center">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="Tiki Taka"
            width={200}
            height={67}
            priority
            className="h-12 w-auto"
          />
        </Link>
      </div>
    </header>
  );
}
