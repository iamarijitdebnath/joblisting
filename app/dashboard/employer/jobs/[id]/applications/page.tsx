"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeftIcon } from "lucide-react";

interface Application {
    _id: string;
    userId: {
        _id: string;
        name: string;
        email: string;
    };
    resumeUrl: string;
    coverLetter?: string;
    status: string;
    createdAt: string;
}

interface Job {
    _id: string;
    title: string;
    company: string;
    location: string;
}

export default function JobApplicationsPage() {
    const params = useParams();
    const { toast } = useToast();
    const [applications, setApplications] = useState<Application[]>([]);
    const [job, setJob] = useState<Job | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch job details
                const jobResponse = await fetch(`/api/jobs/${params.id}`);
                if (!jobResponse.ok) {
                    throw new Error("Failed to fetch job details");
                }
                const jobData = await jobResponse.json();
                setJob(jobData);

                // Fetch applications
                const applicationsResponse = await fetch(`/api/applications?jobId=${params.id}`);
                if (!applicationsResponse.ok) {
                    throw new Error("Failed to fetch applications");
                }
                const data = await applicationsResponse.json();
                setApplications(data.applications);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast({
                    title: "Error",
                    description: "Failed to fetch applications",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [params.id, toast]);

    const handleStatusChange = async (applicationId: string, newStatus: string) => {
        try {
            const response = await fetch(`/api/applications/${applicationId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                throw new Error("Failed to update application status");
            }

            setApplications((prev) =>
                prev.map((app) =>
                    app._id === applicationId ? { ...app, status: newStatus } : app
                )
            );

            toast({
                title: "Success",
                description: "Application status updated",
            });
        } catch (error) {
            console.error("Error updating status:", error);
            toast({
                title: "Error",
                description: "Failed to update application status",
                variant: "destructive",
            });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "reviewed":
                return "bg-blue-100 text-blue-800";
            case "interviewing":
                return "bg-purple-100 text-purple-800";
            case "offered":
                return "bg-green-100 text-green-800";
            case "rejected":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const filteredApplications = applications.filter((app) =>
        statusFilter === "all" ? true : app.status === statusFilter
    );

    if (isLoading) {
        return (
            <div className="container max-w-7xl mx-auto py-8 px-4">
                <div className="flex items-center mb-8">
                    <Skeleton className="h-8 w-48" />
                </div>
                <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-48" />
                    ))}
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="container max-w-7xl mx-auto py-8 px-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Job Not Found</h1>
                    <Button asChild>
                        <Link href="/dashboard/employer">Return to Dashboard</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container max-w-7xl mx-auto py-8 px-4">
            <div className="mb-8">
                <Link
                    href="/dashboard/employer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
                >
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold mb-2">Applications for {job.title}</h1>
                <p className="text-gray-600">
                    {job.company} · {job.location}
                </p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>All Applications</CardTitle>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Applications</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="reviewed">Reviewed</SelectItem>
                                <SelectItem value="interviewing">Interviewing</SelectItem>
                                <SelectItem value="offered">Offered</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredApplications.length === 0 ? (
                        <div className="text-center py-12">
                            <h3 className="text-lg font-semibold mb-2">No applications found</h3>
                            <p className="text-muted-foreground">
                                {statusFilter === "all"
                                    ? "No one has applied to this job yet"
                                    : `No applications with status "${statusFilter}"`}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {filteredApplications.map((application) => (
                                <div
                                    key={application._id}
                                    className="border rounded-lg p-6 space-y-4"
                                >
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                        <div className="space-y-2">
                                            <h3 className="text-xl font-semibold">
                                                {application.userId.name}
                                            </h3>
                                            <p className="text-gray-600">{application.userId.email}</p>
                                            <div className="flex flex-wrap gap-2">
                                                <Badge
                                                    className={getStatusColor(application.status)}
                                                    variant="outline"
                                                >
                                                    {application.status.charAt(0).toUpperCase() +
                                                        application.status.slice(1)}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                            >
                                                <a
                                                    href={application.resumeUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    View Resume
                                                </a>
                                            </Button>
                                            <Select
                                                value={application.status}
                                                onValueChange={(value) =>
                                                    handleStatusChange(application._id, value)
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Update status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pending">Pending</SelectItem>
                                                    <SelectItem value="reviewed">Reviewed</SelectItem>
                                                    <SelectItem value="interviewing">Interviewing</SelectItem>
                                                    <SelectItem value="offered">Offered</SelectItem>
                                                    <SelectItem value="rejected">Rejected</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    {application.coverLetter && (
                                        <div className="mt-4">
                                            <h4 className="font-medium mb-2">Cover Letter</h4>
                                            <p className="text-gray-600 whitespace-pre-line">
                                                {application.coverLetter}
                                            </p>
                                        </div>
                                    )}
                                    <p className="text-sm text-gray-500">
                                        Applied {formatDistanceToNow(new Date(application.createdAt), { addSuffix: true })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}