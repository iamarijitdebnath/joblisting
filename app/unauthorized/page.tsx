import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="container max-w-screen-lg mx-auto py-12 px-4 text-center">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Unauthorized Access</h1>
        <p className="text-gray-600 mb-8">
          You don&apos;t have permission to access this page. Please sign in with an appropriate account.
        </p>
        <div className="space-x-4">
          <Button asChild variant="outline">
            <Link href="/">Go to Home</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}