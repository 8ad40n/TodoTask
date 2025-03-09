"use client";

import { AuthContext } from "@/providers/AuthProvider";
import { AuthContextType } from "@/types";
import { CheckCircle2, User } from "lucide-react";
import Image from "next/image";
import { useContext } from "react";

function Navbar() {
  const auth = useContext(AuthContext) as AuthContextType;
  const { user } = auth;

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <CheckCircle2 size={24} className="primary-color" />
              <span className="ml-2 text-xl font-semibold text-gray-800">
                Todo<span className="primary-color">Task</span>
              </span>
            </div>
            <div className="flex items-center gap-6">
              <div className="">
                {user && (
                  <div>
                    {user.photoURL ? (
                      <Image
                        height={30}
                        width={30}
                        src={user.photoURL}
                        alt="User"
                        className="rounded-full"
                      />
                    ) : (
                      <User size={24} className="text-gray-600" />
                    )}
                  </div>
                )  }
              </div>

            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
