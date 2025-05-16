import { notFound } from "next/navigation";
import JobDetailPage from "@/components/jobs/job-detail-page";
import { Metadata } from "next";

interface JobPageProps {
  params: {
    id: string;
  };
}

async function getJob(id: string) {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/jobs/${id}`, {
      cache: "no-store",
    });
    
    if (!res.ok) {
      throw new Error("Failed to fetch job");
    }
    
    return res.json();
  } catch (error) {
    console.error("Error fetching job:", error);
    return null;
  }
}

export async function generateMetadata({ params }: JobPageProps): Promise<Metadata> {
  const job = await getJob(params.id);
  
  if (!job) {
    return {
      title: "Job Not Found | JobHub",
      description: "The job listing you're looking for does not exist.",
    };
  }
  
  return {
    title: `${job.title} at ${job.company} | JobHub`,
    description: job.description.substring(0, 160) + "...",
  };
}

export default async function JobPage({ params }: JobPageProps) {
  const job = await getJob(params.id);
  
  if (!job) {
    notFound();
  }
  
  return <JobDetailPage job={job} />;
}