import { buildEmailTemplate } from "@/lib/emails/emailTemplates";
import { sampleData } from "@/app/explore/sample_data";

export default function SampleNews({
  setIsOpenNewsModal,
}: {
  setIsOpenNewsModal: (isOpen: boolean) => void;
}) {
  const htmlContent = buildEmailTemplate(sampleData)
  return (
    <div
      className="relative bg-[#FCFAF4] text-gray-800 max-h-[100vh] overflow-y-auto p-8 shadow-xl max-w-5xl mx-auto rounded-md border border-gray-300"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close Button */}
      <button
        className="absolute top-3 right-5 text-gray-500 hover:text-gray-800 text-3xl font-bold"
        onClick={() => setIsOpenNewsModal(false)}
      >
        &times;
      </button>
      <div
        className="mt-6"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
      
    </div>
  );
}
