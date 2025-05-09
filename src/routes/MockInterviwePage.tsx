import { db } from '@/config/firebase.config'
import { Interview } from '@/types'
import { doc, getDoc } from 'firebase/firestore'

import { useEffect } from 'react'
import { useState } from 'react'
import LoaderPage from './loaderpage'
import { useNavigate, useParams } from 'react-router'
import { CustomBreadCrumb } from '@/components/custombreadCrumb'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Lightbulb } from 'lucide-react'

import QuestionForm from '@/components/QuestionForm'

const MockInterviwePage = () => {
  const {interviewId} = useParams <{interviewId : string}>()

      const [isLoading] = useState(false)
      const [interview, setinterview] = useState <Interview | null >(null)

      
    const navigate = useNavigate()

    if(isLoading) {
      return <LoaderPage className='w-full h-[78vh]' />
    }

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

      
  return (

    <div className='flex flex-col w-full gap-8 py-5'> 
       <CustomBreadCrumb 
                 breadCrumbPage="Start"
                 breadCrumpItems={[{label : "Mock Interviews" , link: "/generate"},
                  {
                    label : interview?.position || "",
                    link : `/generate/interview/${interview?.id}`
                  }
                 ]}
                 
                 
                 />

                 <div className='w-full'>
                 <Alert className="bg-sky-100 border border-sky-200 p-4 rounded-lg flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-sky-600" />
          <div>
            <AlertTitle className="text-sky-800 font-semibold">
              Important Note
            </AlertTitle>
            <AlertDescription className="text-sm text-sky-700 mt-1 leading-relaxed">
              Press "Record Answer" to begin answering the question. Once you
              finish the interview, you&apos;ll receive feedback comparing your
              responses with the ideal answers.
              <br />
              <br />
              <strong>Note:</strong>{" "}
              <span className="font-medium">Your video is never recorded.</span>{" "}
              You can disable the webcam anytime if preferred.
            </AlertDescription>
          </div>
        </Alert>
                 </div>


                 {interview?.questions &&  interview.questions.length> 0 &&(
                  <div className='mt-4 w-full flex flex-col items-start  gap-4'>
                <QuestionForm questions={interview.questions} />

                  </div>
                 )}
    </div>
  )
}

export default MockInterviwePage
