"use client";
import AskSection from "./ask";
import QuestionSection from "./question";
export default function FaqsPage() {
  

  return (
    <div className="sm:px-[120px] lg:px-[120px] px-[120px]">
      <div className=" space-y-[57px]">
        <div className=" space-y-[57px]">
          <p className="items-center text-center text-[36px]">
            Quick Start -- Frequently Asked Question of
            <span className="primary-color text-[36px] font-tamdan-bold"> TAMDAN</span>
          </p>
          <p>
            You’ve entered the FAQ Path — where TAMDAN answers all your
            questions. Learn how our AI finds trusted news, sends updates to
            your Telegram or Gmail, and keeps your information accurate and
            personal. Still wondering about something? Just ask TAMDAN — your AI
            guide is listening.
          </p>
        </div>
        <div>
            <QuestionSection />
        </div>
        <div>
          <AskSection/>
        </div>
      </div>
    </div>
  );
}
