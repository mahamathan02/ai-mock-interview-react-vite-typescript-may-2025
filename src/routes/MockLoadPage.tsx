import  { useEffect, useState } from 'react'
import { Interview } from '@/types'
import { Link, useNavigate, useParams } from 'react-router'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/config/firebase.config'
import { Lightbulb, Loader, Sparkle, WebcamIcon } from 'lucide-react'
import LoaderPage from './loaderpage'
import { CustomBreadCrumb } from '@/components/custombreadCrumb'
import { Button } from '@/components/ui/button'
import InterviewPin from '@/components/pin'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Webcam from "react-webcam";


const MockLoadPage = () => {

   const {interviewId} = useParams <{interviewId : string}>()
    const [isLoading] = useState(false)
    const [interview, setinterview] = useState <Interview | null >(null)
    const [isWebCamEnabled, setisWebCamEnabled] = useState(false)

    const navigate = useNavigate()

    if(!interviewId){
        navigate("/generate" , {replace: true})
    }

    if(!interview){
      navigate("/generate" , {replace: true})
  }


    useEffect(() => {
        const fetchInterview = async () => {
          if (interviewId) {
            try {
              const interviewDoc = await getDoc(doc(db, "interview", interviewId));
              if (interviewDoc.exists()) {
                setinterview({id: interviewDoc.id , ...interviewDoc.data() } as Interview);
              }
            } catch (error) {
              console.error("Failed to fetch interview:", error);
            }
          }
        };
    
        fetchInterview();
      }, [interviewId , navigate]);


      if(isLoading) {
        return <LoaderPage className='w-full h-[78vh]' />
      }
  return (
    <div className='flex flex-col w-full gap-8 py-8'>
        <div className='flex items-center justify-between w-full gap-2'>
            <CustomBreadCrumb 
            breadCrumbPage={interview?.position || ""}
            breadCrumpItems={[{label : "Mock Interviews" , link: "/generate"}]}
            
            
            />

            <Link to={`/generate/interview/${interviewId}/start`}>
            <Button size={"sm"}>
              Start <Sparkle />
            </Button>
            
            </Link>

        </div>
        {interview && <InterviewPin interview = {interview} onMockPage />}
        <Alert className="bg-yellow-100/50 border-yellow-200 p-4 rounded-lg flex items-start gap-3 -mt-3">
        <Lightbulb className="h-5 w-5 text-yellow-600" />
        <div>
          <AlertTitle className="text-yellow-800 font-semibold">
            Important Information
          </AlertTitle>
          <AlertDescription className="text-sm text-yellow-700 mt-1">
            Please enable your webcam and microphone to start the AI-generated
            mock interview. The interview consists of five questions. You’ll
            receive a personalized report based on your responses at the end.{" "}
            <br />
            <br />
            <span className="font-medium">Note:</span> Your video is{" "}
            <strong>never recorded</strong>. You can disable your webcam at any
            time.
          </AlertDescription>
        </div>
      </Alert>

        <div className='flex items-center justify-center w-full h-full'>
          <div className='w-full h-[400px] md:w-96 flex flex-col items-center justify-center border p-4 bg-gray-50 rounded-md'>

            {isWebCamEnabled ?(
              <Webcam 
              onUserMedia={() => setisWebCamEnabled(true)}
              onUserMediaError={() => setisWebCamEnabled(false)}
              className='w-full h-full object-cover rounded-md'
              
              
              
              />

            ) :(
              <WebcamIcon  className='min-w-24 min-h-24 text-muted-foreground'/>
            )}
            

          </div>
        </div>
        <div className='flex items-center justify-center'>
          <Button onClick={() => setisWebCamEnabled(!isWebCamEnabled)} >

            {isWebCamEnabled ? "Disable Web Cam" : "Enable Web Cam"}
          </Button>
        </div>
    
    </div>
  )
}

export default MockLoadPage
