import Divider from "@/components/divider";

export default function Footer() {
  return (
    <footer className="bg-primary-color text-white py-6 md:py-8 lg:py-10">
      <div className="px-4 sm:px-6 md:px-12 lg:px-[120px]">
        {/* Contact Information */}
        <div className="mb-6 space-y-3">
          <a href="https://maps.app.goo.gl/aKbjnkyvMnWQCgsT6" target="_blank" rel="noopener noreferrer" className="font-[TamdanRegular] text-sm md:text-base flex flex-col md:flex-row md:items-start gap-1 md:gap-0">
            <strong className="font-[TamdanBold] flex-shrink-0">Address:</strong>
            <span className="block md:inline">
              Bridge 2, National Road 6A, Sangkat Prek Leap, Khan Chroy Changva,
              Phnom Penh
            </span>
          </a>
          <a href="mailto:tamdan.cadt@gmail.com" className="font-[TamdanRegular] text-sm md:text-base flex items-center gap-1">
            <strong className="font-[TamdanBold] flex-shrink-0">Email:</strong>
            <span>tamdan.cadt@gmail.com</span>
          </a>
        </div>

        <Divider />

        {/* Footer Logo and Copyright */}
        <div className="text-center mt-6 space-y-2">
          <img
            src="/image/footerLogo.png"
            alt="TAMDAN Logo"
            className="h-auto w-auto mx-auto mb-1 max-h-12 md:max-h-16"
          />
          <p className="font-[TamdanRegular] text-xs md:text-sm px-2 leading-relaxed">
            ©2025 All Rights Reserved | Capstone 2, Group 7, Generation 9 of
            Cambodia Academy of Digital Technology
          </p>
        </div>
      </div>
    </footer>
  );
}