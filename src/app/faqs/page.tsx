"use client";
import AskSection from "./ask";
import QuestionSection from "./question";
export default function FaqsPage() {

  return (
    <div className="px-4 sm:px-6 md:px-12 lg:px-[120px]">
      <div className="space-y-8 sm:space-y-10 md:space-y-12">
        <div className="space-y-6 sm:space-y-8">
          <p className="items-center text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
            Quick Start -- Frequently Asked Question of
            <span className="primary-color font-tamdan-bold"> TAMDAN</span>
          </p>
          <p className="text-sm sm:text-base md:text-lg leading-relaxed">
            You've entered the FAQ Path — where TAMDAN answers all your
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
