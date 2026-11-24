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
            <span className="primary-color font-bold"> TAMDAN</span>
          </p>
          <p className="text-sm sm:text-base md:text-lg leading-relaxed text-gray-700">
            Welcome to the TAMDAN FAQ center. Learn how we deliver personalized news digests, 
            send morning updates to your Telegram or email, and keep you informed every day. 
            Still wondering about something? Send us your inquiry below and our team will get back to you.
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
