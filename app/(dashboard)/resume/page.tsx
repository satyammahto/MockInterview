import { ResumeUploader } from "@/components/ResumeUploader";

export const metadata = {
  title: "Analysis | PrepSense AI",
  description: "Upload and analyze your resume tailored to your target roles.",
};

export default function ResumePage() {
  return (
    <div className="flex flex-col gap-8 p-6 lg:p-10 w-full max-w-6xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">AI Resume Analysis</h1>
        <p className="text-muted-foreground">
          Upload your resume below. Our AI will analyze your experience, extract your skills, and identify your target role to better tailor your mock interviews.
        </p>
      </div>

      <ResumeUploader />
    </div>
  );
}
