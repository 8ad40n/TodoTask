import { Result } from "antd";
import Link from "next/link";

export default function notfound() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
      />
      <Link href="/" className="text-white bg-[#1677ff] px-3 py-2 rounded-lg">Back to Home</Link>
    </div>
  );
}
