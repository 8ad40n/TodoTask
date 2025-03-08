"use client"
import { AuthContext } from "@/providers/AuthProvider";
import { Button, Card } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { toast } from "sonner";

function App() {
  const { LoginWithGoogle } = useContext(AuthContext);
  const router = useRouter();
  const handleGoogle = () =>{
    LoginWithGoogle()
    .then((result)=>{
      console.log("Login Success", result.user);
      toast.success("Successfully logged in");
      router.push("/todo")
    })
    .catch((error) => {
      console.log(error.message);
      toast.error("Failed to login");
    });
  }
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl shadow-lg rounded-xl border-0 p-0 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Side Image */}
          <div className="md:w-1/2 relative">
            <Image
              width={400}
              height={400}
              src="/images/auth.png"
              alt="Productivity"
            />
          </div>

          {/* Login Form */}
          <div className="md:w-1/2 p-8 flex flex-col justify-center">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-semibold text-gray-800 mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-600">Stay organized with our <span className="primary-color">Todo App</span></p>
            </div>

            <Button onClick={handleGoogle}
              type="default"
              size="large"
              className="w-full h-12 flex items-center justify-center gap-3 bg-white hover:bg-gray-50 transition-colors"
            >
              <Image
                height={20}
                width={20}
                src="https://www.google.com/favicon.ico"
                alt="Google"
              />
              <span>Sign in with Google</span>
            </Button>

            <p className="text-sm text-gray-500 text-center mt-6">
              By continuing, you agree to our Terms of Service and Privacy
              Policy
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default App;
