import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useAuth } from '@/auth/useAuth';

const Header = () => {
    const { isAuthenticated, logout, checkAuthStatus } = useAuth();
    const [state, setState] = useState(false);

    const navigation = [
        { title: "Chat", path: "/chatbot" },
        { title: "Quiz", path: "/quiz" },
        { title: "Doc-Chat", path: "/doc-chat" },
    ];

    useEffect(() => {
        document.onclick = (e) => {
            const target = e.target;
            if (!target.closest(".menu-btn")) setState(false);
        };
        checkAuthStatus();
    }, [checkAuthStatus]);

    const handleLogout = async () => {
        await logout();
        window.location.reload();
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black md:text-sm border-2 rounded-2xl mx-2 my-1.5 md:mx-6">
            <div className="gap-x-14 items-center max-w-screen-xl py-1 mx-auto px-4 md:flex md:px-8">
                <div className="flex items-center justify-between  md:block">
                    <Link href="/">
                        {/* <Image
                            src="/Croxxlearn ai logo.png"
                            width={200}
                            height={100}
                            alt="logo"
                        /> */}
                        <img src='/Croxxlearn ai logo.png' width={200} height={100}/>
                    </Link>
                    <div className="md:hidden">
                        <button className="menu-btn text-white hover:text-gray-200"
                            onClick={() => setState(!state)}
                        >
                            {state ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
                <div className={`flex-1 items-center md:flex border-white ${state ? 'block' : 'hidden'} `}>
                    <ul className="justify-center md:pl-64 flex md:flex-row flex-col gap-3">
                        {navigation.map((item, idx) => (
                            <li key={idx} className="text-white hover:underline text-lg">
                                <a href={item.path} className="block">
                                    {item.title}
                                </a>
                            </li>
                        ))}
                    </ul>
                    <div className="flex-1 gap-x-6 items-center justify-end my-4 space-y-6 md:flex md:space-y-0 ">
                        {!isAuthenticated && (
                            <Link href="/register" className="block text-white hover:text-gray-200">
                                Sign up
                            </Link>
                        )}
                        {isAuthenticated ? (
                            <button onClick={handleLogout} className="flex items-center justify-center gap-x-1 py-2 px-4 w-full md:w-20 text-black font-medium bg-white hover:bg-yellow-400 active:bg-gray-900 rounded-full md:inline-flex">
                                Logout
                            </button>
                        ) : (
                            <Link href="/login" className="flex items-center justify-center gap-x-1 py-2 px-4 text-black font-medium bg-white hover:bg-yellow-400 active:bg-gray-900 rounded-full md:inline-flex">
                                Sign in
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                </svg>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Header;