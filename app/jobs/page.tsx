import JobsList from "@/components/jobs/jobs-list";
import JobsFilter from "@/components/jobs/jobs-filter";

export const metadata = {
  title: "Browse Jobs | JobHub",
  description: "Find your next career opportunity with top companies",
};

export default function JobsPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-screen-xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Jobs</h1>
          <p className="text-gray-600">
            Find your next career opportunity with top companies
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <JobsFilter />
          </div>
          <div className="lg:col-span-3">
            <JobsList />
          </div>
        </div>
      </div>
    </div>
  );
}