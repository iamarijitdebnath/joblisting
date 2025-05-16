"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { CheckIcon, FilterIcon, XIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const filterSchema = z.object({
  title: z.string().optional(),
  location: z.string().optional(),
  category: z.string().optional(),
  employmentType: z.string().optional(),
  experienceLevel: z.string().optional(),
  minSalary: z.number().optional(),
  maxSalary: z.number().optional(),
  skills: z.array(z.string()).optional(),
});

type FilterValues = z.infer<typeof filterSchema>;

const categories = [
  "Software Development",
  "Design",
  "Marketing",
  "Sales",
  "Customer Service",
  "Finance",
  "Human Resources",
  "Administration",
  "Engineering",
  "Education",
  "Healthcare",
];

const employmentTypes = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
];

const experienceLevels = [
  { value: "entry", label: "Entry Level" },
  { value: "mid", label: "Mid Level" },
  { value: "senior", label: "Senior Level" },
  { value: "executive", label: "Executive" },
];

const popularSkills = [
  "JavaScript",
  "React",
  "Node.js",
  "Python",
  "Java",
  "TypeScript",
  "HTML",
  "CSS",
  "SQL",
  "UI/UX",
  "Product Management",
  "Marketing",
  "Sales",
];

export default function JobsFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [salaryRange, setSalaryRange] = useState([50000, 150000]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const { register, handleSubmit, reset, setValue } = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      title: searchParams.get("title") || "",
      location: searchParams.get("location") || "",
      category: searchParams.get("category") || "",
      employmentType: searchParams.get("employmentType") || "",
      experienceLevel: searchParams.get("experienceLevel") || "",
      minSalary: searchParams.get("minSalary")
        ? parseInt(searchParams.get("minSalary") as string)
        : undefined,
      maxSalary: searchParams.get("maxSalary")
        ? parseInt(searchParams.get("maxSalary") as string)
        : undefined,
      skills: searchParams.get("skills")
        ? searchParams.get("skills")?.split(",")
        : [],
    },
  });

  // Initialize selectedSkills from URL
  useEffect(() => {
    if (searchParams.get("skills")) {
      setSelectedSkills(searchParams.get("skills")!.split(","));
    }
    
    // Initialize salary range
    if (searchParams.get("minSalary") && searchParams.get("maxSalary")) {
      setSalaryRange([
        parseInt(searchParams.get("minSalary") as string),
        parseInt(searchParams.get("maxSalary") as string),
      ]);
    }
  }, [searchParams]);

  const onSubmit = (data: FilterValues) => {
    // Update data with current state values
    data.minSalary = salaryRange[0];
    data.maxSalary = salaryRange[1];
    data.skills = selectedSkills;
    
    const params = new URLSearchParams();
    
    // Only add defined values to the URL
    if (data.title) params.set("title", data.title);
    if (data.location) params.set("location", data.location);
    if (data.category) params.set("category", data.category);
    if (data.employmentType) params.set("employmentType", data.employmentType);
    if (data.experienceLevel) params.set("experienceLevel", data.experienceLevel);
    if (data.minSalary) params.set("minSalary", data.minSalary.toString());
    if (data.maxSalary) params.set("maxSalary", data.maxSalary.toString());
    if (data.skills && data.skills.length > 0) params.set("skills", data.skills.join(","));
    
    router.push(`/jobs?${params.toString()}`);
    setShowMobileFilter(false);
  };

  const clearFilters = () => {
    reset({
      title: "",
      location: "",
      category: "",
      employmentType: "",
      experienceLevel: "",
      minSalary: undefined,
      maxSalary: undefined,
      skills: [],
    });
    setSalaryRange([50000, 150000]);
    setSelectedSkills([]);
    router.push("/jobs");
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  };

  const filterContent = (
    <div className="space-y-6">
      <div>
        <Label htmlFor="title">Job Title</Label>
        <Input
          id="title"
          placeholder="Search by job title"
          className="mt-1"
          {...register("title")}
        />
      </div>
      
      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          placeholder="City, state, or remote"
          className="mt-1"
          {...register("location")}
        />
      </div>
      
      <Separator />
      
      <Accordion type="multiple" defaultValue={["category", "employment", "experience", "salary", "skills"]}>
        <AccordionItem value="category">
          <AccordionTrigger>Job Category</AccordionTrigger>
          <AccordionContent>
            <Select
              onValueChange={(value) => setValue("category", value)}
              defaultValue={searchParams.get("category") || undefined}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="employment">
          <AccordionTrigger>Employment Type</AccordionTrigger>
          <AccordionContent>
            <Select
              onValueChange={(value) => setValue("employmentType", value)}
              defaultValue={searchParams.get("employmentType") || undefined}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {employmentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="experience">
          <AccordionTrigger>Experience Level</AccordionTrigger>
          <AccordionContent>
            <Select
              onValueChange={(value) => setValue("experienceLevel", value)}
              defaultValue={searchParams.get("experienceLevel") || undefined}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {experienceLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="salary">
          <AccordionTrigger>Salary Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Slider
                defaultValue={salaryRange}
                min={30000}
                max={300000}
                step={5000}
                value={salaryRange}
                onValueChange={setSalaryRange}
              />
              <div className="flex justify-between text-sm">
                <span>${salaryRange[0].toLocaleString()}</span>
                <span>${salaryRange[1].toLocaleString()}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="skills">
          <AccordionTrigger>Skills</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              {selectedSkills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedSkills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <XIcon
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => toggleSkill(skill)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
              
              <div className="flex flex-wrap gap-2">
                {popularSkills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`text-xs px-2 py-1 rounded-full border ${
                      selectedSkills.includes(skill)
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {selectedSkills.includes(skill) && (
                      <CheckIcon className="h-3 w-3 inline mr-1" />
                    )}
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <div className="flex flex-col gap-2 pt-4">
        <Button type="submit">Apply Filters</Button>
        <Button
          type="button"
          variant="ghost"
          onClick={clearFilters}
        >
          Clear Filters
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Filter */}
      <div className="hidden lg:block sticky top-24 bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Filter Jobs</h2>
        <form onSubmit={handleSubmit(onSubmit)}>{filterContent}</form>
      </div>
      
      {/* Mobile Filter Button */}
      <div className="lg:hidden">
        <Button
          onClick={() => setShowMobileFilter(true)}
          className="w-full mb-4 flex items-center justify-center"
        >
          <FilterIcon className="mr-2 h-4 w-4" />
          Filter Jobs
        </Button>
      </div>
      
      {/* Mobile Filter Overlay */}
      {showMobileFilter && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Filter Jobs</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMobileFilter(false)}
              >
                <XIcon className="h-5 w-5" />
              </Button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>{filterContent}</form>
          </div>
        </div>
      )}
    </>
  );
}