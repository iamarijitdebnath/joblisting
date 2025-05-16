"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function CreateJobPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const jobData = {
        title: formData.get("title"),
        description: formData.get("description"),
        location: formData.get("location"),
        category: formData.get("category"),
        employmentType: formData.get("employmentType"),
        experienceLevel: formData.get("experienceLevel"),
        salaryMin: parseInt(formData.get("salaryMin") as string),
        salaryMax: parseInt(formData.get("salaryMax") as string),
        skills: (formData.get("skills") as string).split(",").map(skill => skill.trim()),
      };

      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jobData),
      });

      if (!response.ok) {
        throw new Error("Failed to create job");
      }

      toast({
        title: "Success",
        description: "Job posting created successfully",
      });

      router.push("/dashboard/employer");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create job posting",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center w-full py-8">
      <Card >
        <CardHeader>
          <CardTitle>Create New Job Posting</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Job Title</label>
              <Input id="title" name="title" required />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Job Description</label>
              <Textarea id="description" name="description" required />
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium">Location</label>
              <Input id="location" name="location" required />
            </div>

            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">Category</label>
              <Input id="category" name="category" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="employmentType" className="text-sm font-medium">Employment Type</label>
                <Select name="employmentType" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full Time</SelectItem>
                    <SelectItem value="part-time">Part Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="experienceLevel" className="text-sm font-medium">Experience Level</label>
                <Select name="experienceLevel" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entry Level</SelectItem>
                    <SelectItem value="mid">Mid Level</SelectItem>
                    <SelectItem value="senior">Senior Level</SelectItem>
                    <SelectItem value="lead">Lead</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="salaryMin" className="text-sm font-medium">Minimum Salary</label>
                <Input type="number" id="salaryMin" name="salaryMin" required />
              </div>

              <div className="space-y-2">
                <label htmlFor="salaryMax" className="text-sm font-medium">Maximum Salary</label>
                <Input type="number" id="salaryMax" name="salaryMax" required />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="skills" className="text-sm font-medium">Required Skills (comma-separated)</label>
              <Input id="skills" name="skills" placeholder="React, TypeScript, Node.js" required />
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Job Posting"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}