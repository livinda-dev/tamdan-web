import Divider from "@/components/divider";

export default function Footer() {
  return (
    <footer className="bg-primary-color text-white py-6 md:py-8 lg:py-10">
      <div className="px-4 sm:px-6 md:px-12 lg:px-[120px]">
        {/* Contact Information */}
        <div className="mb-6 space-y-3">
          <p className="font-[TamdanRegular] text-sm md:text-base">
            <span className="font-[TamdanBold]">Address: </span>
            <span className="block md:inline mt-1 md:mt-0">
              Bridge 2, National Road 6A, Sangkat Prek Leap, Khan Chroy Changva,
              Phnom Penh
            </span>
          </p>
          <p className="font-[TamdanRegular] text-sm md:text-base">
            <span className="font-[TamdanBold]">Email: </span>
            tamdan.cadt@gmail.com
          </p>
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
            ©2025 All Rights Reserved | Capstone 2, Group 4, Generation 9 of
            Cambodia Academy of Digital Technology
          </p>
        </div>
      </div>
    </footer>
  );
}