'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function About() {
    const [sideMenuOpen, setSideMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-pink-100 relative">
            {/* Side Menu Overlay */}
            {sideMenuOpen && (
                <div
                    className="fixed inset-0 z-40 pointer-events-none"
                    onClick={() => setSideMenuOpen(false)}
                />
            )}

            {/* Side Menu */}
            <div
                className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 z-50 ${sideMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="p-6">
                    <button
                        onClick={() => setSideMenuOpen(false)}
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        ✕
                    </button>

                    <div className="mt-12">
                        <Link
                            href="/"
                            className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-gray-100 transition text-gray-900 font-semibold mb-4"
                            onClick={() => setSideMenuOpen(false)}
                        >
                            <i className="mdi mdi-home text-2xl" />
                            Home Page
                        </Link>
                        <Link
                            href="/about"
                            className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-gray-100 transition text-gray-900 font-semibold"
                            onClick={() => setSideMenuOpen(false)}
                        >
                            <i className="mdi mdi-information-variant-circle text-2xl" />
                            Chi Siamo
                        </Link>
                    </div>
                </div>
            </div>

            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <button
                        onClick={() => setSideMenuOpen(!sideMenuOpen)}
                        className="text-gray-900 font-bold text-2xl hover:text-amber-600 transition"
                    >
                        ☰
                    </button>
                    <Link href="/" className="flex items-center gap-4 hover:opacity-80 transition">
                        <div className="w-14 h-14 relative">
                            <Image
                                src="/alya-logo.jpeg"
                                alt="Alya Logo"
                                width={56}
                                height={56}
                                className="rounded-full"
                            />
                        </div>
                        <div className="text-center">
                            <h1 className="text-2xl font-bold italic text-gray-900">Alya</h1>
                            <p className="text-sm font-semibold italic text-gray-600">Crea, Condividi, Vivi</p>
                        </div>
                    </Link>
                    <div className="w-16" />
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* About Section */}
                <div className="bg-white rounded-lg shadow-lg p-8 mb-8 border-t-4 border-amber-500">
                    <h2 className="text-5xl font-bold italic text-gray-900 mb-8 text-center">
                        <br />
                        Alya<br /><br />
                        Crea, Condividi, Vivi
                    </h2>

                    <p className="text-lg text-gray-700 mb-8">
                        Alya è uno spazio dedicato alle donne e alle ragazze dove potersi incontrare,
                        esprimere la propria creatività e condividere momenti di socialità.
                        L'iniziativa nasce dall'esperienza di due professioniste del territorio che desiderano
                        promuovere momenti di socialità, creatività e crescita personale attraverso semplici
                        attività.
                    </p>

                    <p className="text-lg text-gray-700 mb-8">
                        <strong>Spazio creativo e di benessere per donne e ragazze</strong>
                    </p>



                    <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded">
                        <h3 className="text-2xl font-semibold text-amber-900 mb-6">Il nostro obiettivo</h3>
                        <ul className="space-y-4 text-gray-700">
                            <li className="flex items-start">
                                <span className="text-amber-600 font-bold mr-4 text-lg">•</span>
                                <span className="text-lg">Prendersi del tempo per sé</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-amber-600 font-bold mr-4 text-lg">•</span>
                                <span className="text-lg">Imparare qualcosa di nuovo</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-amber-600 font-bold mr-4 text-lg">•</span>
                                <span className="text-lg">Conoscere nuove persone</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-amber-600 font-bold mr-4 text-lg">•</span>
                                <span className="text-lg">Vivere momenti di condivisione in un ambiente accogliente</span>
                            </li>
                        </ul>
                    </div>
                    <br />
                    <p className="text-lg text-amber-700 font-semibold mb-8">
                        A cura di Giorgia e Valeria
                    </p>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-white mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex justify-between items-start">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1">
                            <div>
                                <h4 className="text-lg font-semibold mb-4">Alya</h4>
                                <p className="text-gray-400 text-sm">
                                    Spazio creativo e di benessere per donne e ragazze. Un progetto di Giorgia e Valeria.
                                </p>
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold mb-4">Link Utili</h4>
                                <ul className="space-y-2 text-gray-400">
                                    <li><Link href="/" className="hover:text-amber-400 transition">Home</Link></li>
                                    <li><Link href="/about" className="hover:text-amber-400 transition">Chi Siamo</Link></li>
                                    <li><Link href="/admin" className="hover:text-amber-400 transition">Area Admin</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold mb-4">Contatti</h4>
                                <div className="flex gap-3 mb-4">
                                    <a href="https://www.instagram.com/alya.condividere?igsh=OGNkZDJkNGg4bndy" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-amber-400 transition">
                                        <i className="mdi mdi-instagram text-2xl" />
                                    </a>
                                    <a href="https://www.facebook.com/share/1HNSQR6Leb/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-amber-400 transition">
                                        <i className="mdi mdi-facebook text-2xl" />
                                    </a>
                                </div>
                                <div className="flex items-center gap-2">
                                    <i className="mdi mdi-email text-gray-400" />
                                    <p className="text-gray-400 text-sm">alya.condividere@gmail.com</p>
                                </div>
                            </div>
                        </div>
                        <div className="w-20 h-20 relative ml-8">
                            <Image
                                src="/alya-logo.jpeg"
                                alt="Alya Logo"
                                width={80}
                                height={80}
                                className="rounded-full"
                            />
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 flex justify-end">
                        <p className="text-gray-400 text-sm">© 2026 Alya - Crea, Condividi, Vivi. Tutti i diritti riservati.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
