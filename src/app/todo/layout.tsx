import Navbar from "@/components/navbar";
import "@ant-design/v5-patch-for-react-19";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div>
    <Navbar></Navbar>
    <div className="mt-16">
    {children}
    </div>
    </div>;
}
