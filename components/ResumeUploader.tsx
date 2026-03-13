'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { uploadResume, ResumeData } from '@/lib/resumeApi';
import { Loader2, UploadCloud, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ResumeUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ResumeData | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a valid PDF document.',
          variant: 'destructive',
        });
        setFile(null);
        e.target.value = ''; // Reset input
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsLoading(true);
    setResult(null);

    try {
      const data = await uploadResume(file);
      setResult(data);
      toast({
        title: 'Success!',
        description: 'Resume analyzed successfully.',
      });
    } catch (error: unknown) {
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <UploadCloud className="w-6 h-6 text-primary" />
            Upload Resume
          </CardTitle>
          <CardDescription>
            Upload your resume in PDF format to instantly extract your skills, projects, and assess your target role.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="resume">Resume (PDF)</Label>
            <Input
              id="resume"
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              disabled={isLoading}
              className="cursor-pointer"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleUpload} 
            disabled={!file || isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Resume'
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Results Section */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <Card className="md:col-span-2 bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                Target Role
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-primary">{result.target_role || 'Not clearly identified'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-lg">Extracted Skills</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {result.skills && result.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {result.skills.map((skill, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center rounded-md bg-secondary px-2.5 py-0.5 text-sm font-semibold text-secondary-foreground transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No specific skills found.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-lg">Key Projects</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {result.projects && result.projects.length > 0 ? (
                result.projects.map((project, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <FileText className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-sm leading-relaxed">{project}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">No clear projects identified.</p>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-lg">Professional Experience</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 block">
              {result.experience && result.experience.length > 0 ? (
                 <ul className="list-disc pl-5 space-y-2 text-sm">
                  {result.experience.map((exp, index) => (
                    <li key={index} className="text-foreground/90">{exp}</li>
                  ))}
                 </ul>
              ) : (
                <p className="text-muted-foreground text-sm">No work experience identified.</p>
              )}
            </CardContent>
          </Card>
          
        </div>
      )}
    </div>
  );
}
