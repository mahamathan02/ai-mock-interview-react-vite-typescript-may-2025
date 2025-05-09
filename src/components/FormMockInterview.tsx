import { Interview } from "@/types";
import { CustomBreadCrumb } from "./custombreadCrumb";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";
import Heading from "./heading";
import { Button } from "./ui/button";
import { Loader, Trash } from "lucide-react";
import { Separator } from "./ui/separator";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { ChatSession } from "@/scripts";
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebase.config";

interface FormMockInterviewProps {
  initialData: Interview | null;
}

const formSchema = z.object({
  position: z
    .string()
    .min(1, "Position is required")
    .max(100, "Position must be 100 characters or less"),
  description: z.string().min(10, "Description is required"),
  experience: z.coerce
    .number()
    .min(0, "Experience cannot be empty or negative"),
  techStack: z.string().min(1, "Tech stack must be at least one character long")
});

type FormData = z.infer<typeof formSchema>;

const FormMockInterview = ({ initialData }: FormMockInterviewProps) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      position: initialData?.position ?? "",
      description: initialData?.description ?? "",
      experience: initialData?.experience ?? 0,
      techStack: initialData?.techStack ?? ""
    }
  });

  const { isValid, isSubmitting } = form.formState;
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { userId } = useAuth();

  const title = initialData?.position || "Create a new Interview";
  const breadCrumbPage = initialData?.position || "Create";
  const actions = initialData ? "Save changes" : "Create";

  const toastMessage = initialData
    ? {
        title: "Updated!",
        description: "Changes saved successfully"
      }
    : {
        title: "Created!",
        description: "New Mock Interview created successfully"
      };


      const cleanAiResponse = ( responseText : string) =>{

        // trim any surrounding whitespace
        let cleanText = responseText.trim()

        // sptep 2 remove any occurances of "json" or code block symbols

           cleanText = cleanText.replace(/(json|```|`)/g, "")
            const jsonArrayMatch = cleanText.match(/\[.*]/s)

            if(jsonArrayMatch) {
                cleanText = jsonArrayMatch[0]
            } else{
                throw new Error("No JSON array found in response")
            }

            try {
                return JSON.parse(cleanText)
                
            } catch (error) {
                throw new Error("Invalid JSON format" + (error as Error) ?. message)
                
            }
      }

      const generateAiResponse = async (data: FormData) => {
        const prompt = `
      As an experienced prompt engineer, generate a JSON array containing 5 technical interview questions along with detailed answers based on the following job information. Each object in the array should have the fields "question" and "answer", formatted as follows:
      
      [
        { "question": "<Question text>", "answer": "<Answer text>" },
        ...
      ]
      
      Job Information:
      - Job Position: ${data?.position}
      - Job Description: ${data?.description}
      - Years of Experience Required: ${data?.experience}
      - Tech Stacks: ${data?.techStack}
      
      The questions should assess skills in ${data?.techStack} development and best practices, problem-solving, and experience handling complex requirements. Please format the output strictly as an array of JSON objects without any additional labels, code blocks, or explanations. Return only the JSON array with questions and answers.
      `;
      
        const aiResults = await ChatSession.sendMessage(prompt)
        // console.log(aiResults.response.text().trim());
        const cleanResponse = cleanAiResponse(aiResults.response.text())
        return cleanResponse

      }


      

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      console.log("Form data submitted:", data);

  
     if(initialData) {
       if(isValid){
        const aiResults = await generateAiResponse(data);
        await updateDoc(doc(db , "interview" , initialData?.id) , {
            question : aiResults,
            ...data,
            updatedAt : serverTimestamp()
        }).catch((error) => console.log(error))
        toast(toastMessage.title,{description:toastMessage.description})
       }

     }else{



        if (isValid) {

           
            const aiResults = await generateAiResponse(data);
    
            await addDoc(collection(db , "interview") , {
                ...data,
                userId,
                questions : aiResults,
                createdAt : serverTimestamp()
            })
    
            toast.success(toastMessage.title, {
                description: toastMessage.description
              });
              
    
          }
     }
     navigate("/generate" , {replace: true})
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Error...", {
        description: "Something went wrong while saving the interview"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      form.reset({
        position: initialData.position,
        description: initialData.description,
        experience: initialData.experience,
        techStack: initialData.techStack
      });
    }
  }, [initialData, form]);


  const handleDelete = async () => {
    if (!initialData?.id) return;
  
    toast("Are you sure you want to delete this interview?", {
      description: "This action cannot be undone.",
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            setLoading(true);
            await deleteDoc(doc(db, "interview", initialData.id));
            toast.success("Deleted!", {
              description: "The interview has been deleted successfully.",
            });
            navigate("/generate", { replace: true });
          } catch (error) {
            console.error("Delete error:", error);
            toast.error("Delete failed", {
              description: "Something went wrong while deleting the interview.",
            });
          } finally {
            setLoading(false);
          }
        }
      }
    });
  };
  
  return (
    <div className="w-full flex-col space-y-4">
      <CustomBreadCrumb
        breadCrumbPage={breadCrumbPage}
        breadCrumpItems={[{ label: "Mock Interviews", link: "/generate" }]}
      />

      <div className="mt-4 flex items-center justify-between w-full">
        <Heading title={title} isSubheading description="" />

        {initialData && (
      <Button size="icon" variant="ghost" onClick={handleDelete} disabled={loading}>
      <Trash className="w-4 h-4 text-red-500" />
    </Button>
    
       
        )}
      </div>

      <Separator />

      <div className="my-6">
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full p-8 rounded-lg flex flex-col items-start justify-start gap-6 shadow-md"
          >
            {/* Position */}
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem className="w-full space-y-4">
                  <div className="w-full flex items-center justify-between">
                    <FormLabel>Job Role / Position</FormLabel>
                    <FormMessage className="text-sm" />
                  </div>
                  <FormControl>
                    <Input
                      disabled={loading}
                      className="h-12"
                      placeholder="e.g. Full stack developer"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="w-full space-y-4">
                  <div className="w-full flex items-center justify-between">
                    <FormLabel>Job Description</FormLabel>
                    <FormMessage className="text-sm" />
                  </div>
                  <FormControl>
                    <Textarea
                      disabled={loading}
                      className="h-12"
                      placeholder="e.g. Describe your job role or position"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Experience */}
            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem className="w-full space-y-4">
                  <div className="w-full flex items-center justify-between">
                    <FormLabel>Years of Experience</FormLabel>
                    <FormMessage className="text-sm" />
                  </div>
                  <FormControl>
                    <Input
                      type="number"
                      disabled={loading}
                      className="h-12"
                      placeholder="e.g. 5"
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Tech Stack */}
            <FormField
              control={form.control}
              name="techStack"
              render={({ field }) => (
                <FormItem className="w-full space-y-4">
                  <div className="w-full flex items-center justify-between">
                    <FormLabel>Tech Stack</FormLabel>
                    <FormMessage className="text-sm" />
                  </div>
                  <FormControl>
                    <Textarea
                      disabled={loading}
                      className="h-12"
                      placeholder="e.g. React, TypeScript (separate with commas)"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Form Buttons */}
            <div className="w-full flex items-center justify-end gap-6">
              <Button
                type="button"
                onClick={() => form.reset()}
                size="sm"
                variant="outline"
                disabled={isSubmitting || loading}
              >
                Reset
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || loading || !isValid}
              >
                {loading ? (
                  <Loader className="text-gray-50 animate-spin" />
                ) : (
                  actions
                )}
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default FormMockInterview;
