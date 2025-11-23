import Divider from "@/components/divider";

export default function Footer() {
  return (
    <footer className="bg-primary-color text-white py-6">
      <div className="sm:px-[120px] lg:px-[120px] px-[120px]">
        {/* Contact Information */}
        <div className="mb-6">
          <p className="font-[TamdanRegular]">
            <span className="font-[TamdanBold]">Address: </span>
            Bridge 2, National Road 6A, Sangkat Prek Leap, Khan Chroy Changva,
            Phnom Penh
          </p>
          <p className="font-[TamdanRegular]">
            <span className="font-[TamdanBold]">Email: </span>
            tamdan.cadt@gmail.com
          </p>
        </div>

        <Divider />

        {/* Footer Logo and Copyright */}
        <div className="text-center mt-6">
          <img
            src="/image/footerLogo.png"
            alt="TAMDAN Logo"
            className="h-auto w-auto mx-auto mb-1"
          />
          <p className="font-[TamdanRegular] text-sm">
            ©2025 All Rights Reserved | Capstone 2, Group 4, Generation 9 of
            Cambodia Academy of Digital Technology
          </p>
        </div>
      </div>
    </footer>
  );
}