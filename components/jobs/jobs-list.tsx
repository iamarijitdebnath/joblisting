"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { IJob } from "@/lib/db/models/Job";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationEllipsis,
  PaginationNext,
} from "@/components/ui/pagination";
import { formatDistanceToNow } from "date-fns";
import { MapPinIcon, BriefcaseIcon, CalendarIcon } from "lucide-react";

export default function JobsList() {
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<IJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState("-createdAt");

  const buildQueryString = () => {
    const params = new URLSearchParams(searchParams);
    params.set("page", currentPage.toString());
    params.set("sort", sortOption);
    return params.toString();
  };

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/jobs?${buildQueryString()}`);
        const data = await response.json();
        setJobs(data.jobs);
        setTotalJobs(data.totalJobs);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [searchParams, currentPage, sortOption]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSortChange = (value: string) => {
    setSortOption(value);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                <div className="space-y-4 flex-1">
                  <div>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <div className="mt-4 md:mt-0 md:ml-4 md:flex md:flex-col md:items-end">
                  <Skeleton className="h-10 w-24 mb-2" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <p className="text-gray-600 mb-4 sm:mb-0">
          {totalJobs} jobs found
        </p>
        <div className="w-full sm:w-auto">
          <Select value={sortOption} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="-createdAt">Newest first</SelectItem>
              <SelectItem value="createdAt">Oldest first</SelectItem>
              <SelectItem value="-salaryMax">Highest salary</SelectItem>
              <SelectItem value="salaryMin">Lowest salary</SelectItem>
              <SelectItem value="title">Job title (A-Z)</SelectItem>
              <SelectItem value="-title">Job title (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {!jobs || jobs.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">No jobs found matching your criteria</p>
          <Button asChild variant="outline">
            <Link href="/jobs">Clear filters</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {jobs.map((job) => (
              <Link key={job._id} href={`/jobs/${job._id}`}>
                <Card className="overflow-hidden transition-all duration-200 hover:shadow-md hover:border-blue-200 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                      <div className="space-y-4 flex-1">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">
                            {job.title}
                          </h3>
                          <p className="text-gray-600">{job.company}</p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">
                            {job.experienceLevel.charAt(0).toUpperCase() +
                              job.experienceLevel.slice(1)}
                          </Badge>
                          <Badge variant="secondary">
                            {job.employmentType.replace("-", " ")}
                          </Badge>
                          {job.skills.slice(0, 2).map((skill, index) => (
                            <Badge key={index} variant="outline">
                              {skill}
                            </Badge>
                          ))}
                          {job.skills.length > 2 && (
                            <Badge variant="outline">+{job.skills.length - 2}</Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500">
                          <div className="flex items-center">
                            <MapPinIcon className="w-4 h-4 mr-1" />
                            <span>{job.location}</span>
                          </div>
                          {job.salaryMin && job.salaryMax && (
                            <div className="flex items-center">
                              <BriefcaseIcon className="w-4 h-4 mr-1" />
                              <span>
                                ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}
                              </span>
                            </div>
                          )}
                          {job.createdAt && (
                            <div className="flex items-center">
                              <CalendarIcon className="w-4 h-4 mr-1" />
                              <span>
                                {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 md:mt-0 md:ml-4 md:flex md:flex-col md:items-end">
                        <Button size="sm">View Job</Button>
                        {job.applicationsCount > 0 && (
                          <p className="text-sm text-gray-500 mt-2">
                            {job.applicationsCount} application{job.applicationsCount !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    if (page === 1 || page === totalPages) return true;
                    if (Math.abs(page - currentPage) <= 1) return true;
                    return false;
                  })
                  .map((page, i, filteredPages) => {
                    const prevPage = filteredPages[i - 1];

                    if (prevPage && page - prevPage > 1) {
                      return (
                        <PaginationItem key={`ellipsis-${page}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }

                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          isActive={page === currentPage}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
}