"use client";

import { AuthContext } from "@/providers/AuthProvider";
import { AuthContextType } from "@/types";
import { CheckCircle2, LogOut, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { toast } from "sonner";

function Navbar() {
  const auth = useContext(AuthContext) as AuthContextType;
  const { user, Logout } = auth;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    Logout()
      .then(() => {
        toast.success("Logged out");
        router.push("/");
      })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-100 z-50">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/todo" className="flex items-center">
              <CheckCircle2 size={24} className="primary-color" />
              <span className="ml-2 text-xl font-semibold text-gray-800">
                Todo<span className="primary-color">Task</span>
              </span>
            </Link>

            <div className="relative">
              {user ? (
                <div>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="focus:outline-none"
                  >
                    {user.photoURL ? (
                      <Image
                        height={30}
                        width={30}
                        src={user.photoURL}
                        alt="User"
                        className="rounded-full cursor-pointer"
                      />
                    ) : (
                      <User size={30} className="text-gray-600 cursor-pointer" />
                    )}
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg p-3 z-50">
                      <p className="text-gray-800 font-semibold text-sm">{user.displayName}</p>
                      <p className="text-gray-600 text-xs">{user.email}</p>
                      <button
                        onClick={handleLogout}
                        className="mt-3 w-full flex items-center gap-2 text-red-600 hover:bg-red-100 py-2 px-3 rounded-md"
                      >
                        <LogOut size={18} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/" className="px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-400">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;