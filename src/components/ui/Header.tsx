import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 py-2 px-4 shadow-sm">
      <div className="max-w-lg mx-auto flex justify-center items-center">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="Tiki Taka"
            width={280}
            height={93}
            priority
            className="h-16 w-auto"
          />
        </Link>
      </div>
    </header>
  );
}
