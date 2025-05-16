"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { IJob } from "@/lib/db/models/Job";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  MapPinIcon, 
  BriefcaseIcon, 
  CalendarIcon, 
  BuildingIcon,
  DollarSignIcon,
  ClockIcon,
  ShareIcon,
  BookmarkIcon,
  ArrowLeftIcon,
  CheckIcon,
  AlertCircleIcon
} from "lucide-react";

interface JobDetailPageProps {
  job: IJob;
}

export default function JobDetailPage({ job }: JobDetailPageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isApplying, setIsApplying] = useState(false);
  const [resumeUrl, setResumeUrl] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      toast.error("Please sign in to apply for this job");
      router.push(`/auth/signin?callbackUrl=/jobs/${job._id}`);
      return;
    }
    
    if (session.user.role !== "jobSeeker") {
      toast.error("Only job seekers can apply for jobs");
      return;
    }
    
    if (!resumeUrl) {
      toast.error("Please provide a resume URL");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: job._id,
          resumeUrl,
          coverLetter,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit application");
      }
      
      setApplicationSubmitted(true);
      toast.success("Application submitted successfully!");
      
      // Close the modal after a delay
      setTimeout(() => {
        setIsApplying(false);
        setResumeUrl("");
        setCoverLetter("");
        setIsSubmitting(false);
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <Link href="/jobs" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <ArrowLeftIcon className="w-4 h-4 mr-2" /> Back to jobs
        </Link>
        
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div>
                <CardTitle className="text-2xl md:text-3xl mb-2">{job.title}</CardTitle>
                <CardDescription className="text-base">
                  <span className="font-medium">{job.company}</span> · {job.location}
                </CardDescription>
              </div>
              
              <div className="flex flex-col gap-2">
                {session?.user.role === "jobSeeker" ? (
                  <Dialog open={isApplying} onOpenChange={setIsApplying}>
                    <DialogTrigger asChild>
                      <Button size="lg">Apply Now</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Apply for {job.title}</DialogTitle>
                        <DialogDescription>
                          Submit your application for this position at {job.company}
                        </DialogDescription>
                      </DialogHeader>
                      
                      {applicationSubmitted ? (
                        <div className="flex flex-col items-center py-6 text-center">
                          <div className="rounded-full bg-green-100 p-3 mb-4">
                            <CheckIcon className="h-6 w-6 text-green-600" />
                          </div>
                          <h3 className="text-lg font-medium mb-2">Application Submitted!</h3>
                          <p className="text-gray-500 mb-4">
                            Your application has been sent to {job.company}. You can track your application status
                            in your dashboard.
                          </p>
                          <Button asChild variant="outline">
                            <Link href="/dashboard/job-seeker/applications">
                              View My Applications
                            </Link>
                          </Button>
                        </div>
                      ) : (
                        <form onSubmit={handleApply} className="space-y-4">
                          <div className="space-y-2">
                            <label htmlFor="resumeUrl" className="text-sm font-medium">
                              Resume URL <span className="text-red-500">*</span>
                            </label>
                            <Input
                              id="resumeUrl"
                              placeholder="https://example.com/your-resume.pdf"
                              value={resumeUrl}
                              onChange={(e) => setResumeUrl(e.target.value)}
                              required
                            />
                            <p className="text-xs text-gray-500">
                              Provide a link to your resume (PDF, Google Doc, etc.)
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <label htmlFor="coverLetter" className="text-sm font-medium">
                              Cover Letter
                            </label>
                            <Textarea
                              id="coverLetter"
                              placeholder="Tell us why you're interested in this position..."
                              rows={6}
                              value={coverLetter}
                              onChange={(e) => setCoverLetter(e.target.value)}
                            />
                          </div>
                          
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsApplying(false)}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                              {isSubmitting ? "Submitting..." : "Submit Application"}
                            </Button>
                          </div>
                        </form>
                      )}
                    </DialogContent>
                  </Dialog>
                ) : session?.user.role === "employer" ? (
                  <div className="text-center p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-700 flex items-center justify-center">
                      <AlertCircleIcon className="h-4 w-4 mr-2" />
                      Employers cannot apply to jobs
                    </p>
                  </div>
                ) : (
                  <Button asChild size="lg">
                    <Link href={`/auth/signin?callbackUrl=/jobs/${job._id}`}>
                      Sign in to Apply
                    </Link>
                  </Button>
                )}
                
                <div className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <BookmarkIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <ShareIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center">
                <MapPinIcon className="w-5 h-5 text-gray-500 mr-2" />
                <span>{job.location}</span>
              </div>
              
              <div className="flex items-center">
                <BriefcaseIcon className="w-5 h-5 text-gray-500 mr-2" />
                <span className="capitalize">{job.employmentType.replace("-", " ")}</span>
              </div>
              
              <div className="flex items-center">
                <DollarSignIcon className="w-5 h-5 text-gray-500 mr-2" />
                <span>
                  {job.salaryMin && job.salaryMax
                    ? `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}`
                    : "Salary not specified"}
                </span>
              </div>
              
              <div className="flex items-center">
                <BuildingIcon className="w-5 h-5 text-gray-500 mr-2" />
                <span>{job.company}</span>
              </div>
              
              <div className="flex items-center">
                <ClockIcon className="w-5 h-5 text-gray-500 mr-2" />
                <span>Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
              </div>
              
              {job.applicationDeadline && (
                <div className="flex items-center">
                  <CalendarIcon className="w-5 h-5 text-gray-500 mr-2" />
                  <span>Apply before {formatDate(job.applicationDeadline.toString())}</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {job.skills.map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
            
            <Separator className="my-6" />
            
            <div className="space-y-6">
              <section>
                <h3 className="text-xl font-semibold mb-3">Job Description</h3>
                <p className="whitespace-pre-line">{job.description}</p>
              </section>
              
              <section>
                <h3 className="text-xl font-semibold mb-3">Requirements</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {job.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </section>
              
              <section>
                <h3 className="text-xl font-semibold mb-3">Responsibilities</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {job.responsibilities.map((resp, index) => (
                    <li key={index}>{resp}</li>
                  ))}
                </ul>
              </section>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col sm:flex-row gap-4 justify-between bg-gray-50 rounded-b-lg">
            <div>
              <p className="text-sm text-gray-500">
                Job ID: {job._id.toString().substring(0, 8)}...
              </p>
            </div>
            <Button size="lg">Apply Now</Button>
          </CardFooter>
        </Card>
        
        <div className="text-center mb-8">
          <h3 className="text-lg font-semibold mb-2">Not interested in this job?</h3>
          <p className="text-gray-600 mb-4">
            Explore more opportunities in {job.category} or browse all job categories.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="outline">
              <Link href={`/jobs?category=${encodeURIComponent(job.category)}`}>
                More {job.category} Jobs
              </Link>
            </Button>
            <Button asChild>
              <Link href="/jobs">Browse All Jobs</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}