"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IJob } from "@/lib/db/models/Job";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { MapPinIcon, BriefcaseIcon, CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function FeaturedJobs() {
  const [jobs, setJobs] = useState<IJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch("/api/jobs?limit=6");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setJobs(data.jobs);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        toast({
          title: "Error",
          description: "Failed to fetch jobs. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-6">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-6" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6 mb-2" />
              <Skeleton className="h-4 w-4/6" />
            </CardContent>
            <CardFooter className="flex justify-between p-6 pt-0">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-10 w-1/3" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No jobs found. Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.map((job) => (
        <Link href={`/jobs/${job._id}`} key={job._id}>
          <Card className="overflow-hidden h-full transition-all duration-200 hover:shadow-md hover:border-blue-200 cursor-pointer">
            <CardContent className="p-6">
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-1 line-clamp-1">
                  {job.title}
                </h3>
                <p className="text-gray-600">{job.company}</p>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-500">
                  <MapPinIcon className="w-4 h-4 mr-2" />
                  <span className="text-sm">{job.location}</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <BriefcaseIcon className="w-4 h-4 mr-2" />
                  <span className="text-sm">{job.employmentType.replace("-", " ")}</span>
                </div>
                {job.createdAt && (
                  <div className="flex items-center text-gray-500">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {job.skills.slice(0, 3).map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
                {job.skills.length > 3 && (
                  <Badge variant="outline">+{job.skills.length - 3}</Badge>
                )}
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 p-4 flex justify-between items-center">
              <div>
                {job.salaryMin && job.salaryMax && (
                  <p className="text-sm font-medium text-gray-700">
                    ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}
                  </p>
                )}
              </div>
              <Button variant="ghost" size="sm">
                View Job
              </Button>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
}