"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IJob } from "@/lib/db/models/Job";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { PlusIcon, BriefcaseIcon, UsersIcon, ClockIcon } from "lucide-react";

export default function EmployerDashboard() {
    const [jobs, setJobs] = useState<IJob[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await fetch("/api/jobs");
                if (!response.ok) {
                    throw new Error("Failed to fetch jobs");
                }
                const data = await response.json();
                setJobs(data.jobs);
            } catch (error) {
                console.error("Error fetching jobs:", error);
                toast({
                    title: "Error",
                    description: "Failed to fetch your job listings",
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
            <div className="container max-w-7xl mx-auto py-8 px-4">
                <div className="flex justify-between items-center mb-8">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid gap-6">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-48" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container max-w-7xl mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Employer Dashboard</h1>
                <Button asChild>
                    <Link href="/dashboard/employer/create">
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Post New Job
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Active Jobs
                                </p>
                                <h2 className="text-3xl font-bold">{jobs.length}</h2>
                            </div>
                            <div className="p-3 bg-primary/10 rounded-full">
                                <BriefcaseIcon className="w-6 h-6 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Total Applications
                                </p>
                                <h2 className="text-3xl font-bold">
                                    {jobs.reduce((acc, job) => acc + (job.applicationsCount || 0), 0)}
                                </h2>
                            </div>
                            <div className="p-3 bg-primary/10 rounded-full">
                                <UsersIcon className="w-6 h-6 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Recent Activity
                                </p>
                                <h2 className="text-3xl font-bold">
                                    {jobs.filter(job => {
                                        const daysSinceCreated = Math.floor(
                                            (Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24)
                                        );
                                        return daysSinceCreated <= 7;
                                    }).length}
                                </h2>
                            </div>
                            <div className="p-3 bg-primary/10 rounded-full">
                                <ClockIcon className="w-6 h-6 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Your Job Listings</CardTitle>
                </CardHeader>
                <CardContent>
                    {jobs.length === 0 ? (
                        <div className="text-center py-12">
                            <h3 className="text-lg font-semibold mb-2">No jobs posted yet</h3>
                            <p className="text-muted-foreground mb-4">
                                Start attracting candidates by posting your first job listing
                            </p>
                            <Button asChild>
                                <Link href="/dashboard/employer/create">Post a Job</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {jobs.map((job) => (
                                <div
                                    key={job._id}
                                    className="flex flex-col md:flex-row justify-between items-start gap-4 p-4 border rounded-lg"
                                >
                                    <div className="space-y-2">
                                        <Link
                                            href={`/jobs/${job._id}`}
                                            className="text-lg font-semibold hover:text-primary"
                                        >
                                            {job.title}
                                        </Link>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="secondary">{job.location}</Badge>
                                            <Badge variant="secondary">
                                                {job.employmentType.replace("-", " ")}
                                            </Badge>
                                            <Badge variant="outline">
                                                {job.applicationsCount || 0} applications
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 w-full md:w-auto">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/jobs/${job._id}`}>View</Link>
                                        </Button>
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/dashboard/employer/jobs/${job._id}/applications`}>
                                                Applications
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}