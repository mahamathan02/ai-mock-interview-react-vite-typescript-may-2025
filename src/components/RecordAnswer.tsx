import { useAuth } from '@clerk/clerk-react';
import {
  CircleStop,
  Loader,
  Mic,
  RefreshCcw,
  Save,
  Video,
  VideoOff,
  WebcamIcon
} from 'lucide-react';
import { useEffect, useState } from 'react';
import useSpeechToText, { ResultType } from 'react-hook-speech-to-text';
import { useParams } from 'react-router';
import { TooltipButton } from './tooltipbutton';
import { toast } from 'sonner';
import Webcam from 'react-webcam';
import { ChatSession } from '@/scripts';
import { SaveModal } from './saveModel';
import { addDoc, collection, doc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { db } from '@/config/firebase.config';

interface RecordAnswerProps {
  question: { question: string; answer: string };
  isWebcamOn: boolean;
  setWebCamOn: (value: boolean) => void;
}

interface AIResponse {
  ratings: number;
  feedback: string;
}

const RecordAnswer = ({ question, isWebcamOn, setWebCamOn }: RecordAnswerProps) => {
  const {
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false
  });

  const [open, setOpen] = useState(false);
  const [aiResult, setAiResult] = useState<AIResponse | null>(null);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const { userId } = useAuth();
  const { interviewId } = useParams();

  const recordUserAnswer = async () => {
    if (isRecording) {
      stopSpeechToText();

      if (userAnswer.length < 30) {
        toast.error('Error', {
          description: 'Your answer should be more than 30 characters'
        });
        return;
      }

      const aiResult = await generateResult(
        question.question,
        question.answer,
        userAnswer
      );
      setAiResult(aiResult);
    } else {
      startSpeechToText();
    }
  };

  const cleanJsonResponse = (responseText: string) => {
    let cleanText = responseText.trim();

    // Remove markdown-style wrappers
    cleanText = cleanText.replace(/```(?:json)?|```/gi, '');

    // Replace unescaped newlines inside JSON strings
    cleanText = cleanText.replace(/\\?(\r?\n)+/g, ' ');

    try {
      console.log("Cleaned AI response:", cleanText);
      return JSON.parse(cleanText);
    } catch (error) {
      console.error("JSON parse failed for:", cleanText);
      throw new Error('Invalid JSON format: ' + (error as Error)?.message);
    }
  };

  const generateResult = async (
    qst: string,
    qstAns: string,
    userAns: string
  ): Promise<AIResponse> => {
    setIsAiGenerating(true);

    const prompt = `
Respond only with a valid JSON object like this:
{
  "ratings": number (1 to 10),
  "feedback": string
}
No commentary or markdown.

Question: """${qst}"""
User Answer: """${userAns}"""
Correct Answer: """${qstAns}"""
Evaluate the user answer.
    `;

    try {
      const aiResult = await ChatSession.sendMessage(prompt);
      const rawText = await aiResult.response.text();
      console.log("AI raw response:", rawText);
      const parsedResult: AIResponse = cleanJsonResponse(rawText);
      return parsedResult;
    } catch (error) {
      console.log("AI feedback error:", error);
      toast("Error", {
        description: "An error occurred while generating feedback."
      });
      return { ratings: 0, feedback: "Unable to generate feedback" };
    } finally {
      setIsAiGenerating(false);
    }
  };

  const saveUserAnswer = async () => {
    setLoading(true);

    if (!aiResult) return;

    const currentQuestion = question.question;

    try {
      const userAnswerQuery = query(
        collection(db, "userAnswers"),
        where("userId", "==", userId),
        where("question", "==", currentQuestion)
      );

      const querySnap = await getDocs(userAnswerQuery);

      if (!querySnap.empty) {
        toast.info("Already Answered", {
          description: "You have already answered this question",
        });
        return;
      }

      const questionAnswerRef = await addDoc(collection(db, "userAnswers"), {
        mockIdRef: interviewId,
        question: question.question,
        correct_ans: question.answer,
        user_ans: userAnswer,
        feedback: aiResult.feedback,
        rating: aiResult.ratings,
        userId,
        createdAt: serverTimestamp(),
      });

      const id = questionAnswerRef.id;

      await updateDoc(doc(db, "userAnswers", id), {
        id,
        updatedAt: serverTimestamp(),
      });

      toast("Saved", { description: "Your answer has been saved.." });
      setUserAnswer("");
      stopSpeechToText();
    } catch (error) {
      toast("Error", {
        description: "An error occurred while saving the answer.",
      });
      console.log(error);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const recordNewAnswer = () => {
    setUserAnswer('');
    stopSpeechToText();
    startSpeechToText();
  };

  useEffect(() => {
    const combinedTranscript = results
      .filter((result): result is ResultType => typeof result !== 'string')
      .map((result) => result.transcript)
      .join('');
    setUserAnswer(combinedTranscript);
  }, [results]);

  return (
    <div className="w-full flex flex-col items-center gap-8 mt-6">
    <SaveModal
      isOpen={open}
      onClose={() => setOpen(false)}
      onConfirm={saveUserAnswer}
      loading={loading}
    />
  
    {/* Webcam Preview */}
    <div className="w-full md:w-96 h-[300px] flex items-center justify-center border rounded-xl overflow-hidden bg-muted">
      {isWebcamOn ? (
        <Webcam
          audio
          onUserMedia={() => setWebCamOn(true)}
          onUserMediaError={() => setWebCamOn(false)}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-muted-foreground">
          <WebcamIcon className="w-20 h-20" />
          <p className="text-sm mt-2">Webcam is Off</p>
        </div>
      )}
    </div>
  
    {/* Action Buttons */}
    <div className="flex flex-wrap items-center justify-center gap-3">
      <TooltipButton
        content={isWebcamOn ? "Turn Off Camera" : "Turn On Camera"}
        icon={isWebcamOn ? <VideoOff /> : <Video />}
        onClick={() => setWebCamOn(!isWebcamOn)}
      />
  
      <TooltipButton
        content={isRecording ? "Stop Recording" : "Start Recording"}
        icon={isRecording ? <CircleStop /> : <Mic />}
        onClick={recordUserAnswer}
      />
  
      <TooltipButton
        content="Record Again"
        icon={<RefreshCcw />}
        onClick={recordNewAnswer}
        disabled={!userAnswer}
      />
  
      <TooltipButton
        content="Save Answer"
        icon={isAiGenerating ? <Loader className="animate-spin" /> : <Save />}
        onClick={() => setOpen(true)}
        disabled={!aiResult}
      />
    </div>
  
    {/* Answer Display */}
    <div className="w-full md:w-[80%] lg:w-2/3 bg-white border rounded-lg shadow p-5 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">Your Answer</h2>
        <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap min-h-[3rem]">
          {userAnswer || "Start speaking to see your answer here."}
        </p>
        {interimResult && (
          <p className="text-xs text-muted-foreground mt-1">
            <strong>Currently Speaking:</strong> {interimResult}
          </p>
        )}
      </div>
  
      
    </div>
  </div>
  
  );
};

export default RecordAnswer;
