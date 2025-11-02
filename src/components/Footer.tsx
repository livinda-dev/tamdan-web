import Divider from "@/components/divider";

export default function Footer() {
    return (
        <footer className="bg-primary-color text-white py-[48px]">
            <div className="container">
                <div className="sm:px-[120px] lg:px-[120px] px-[120px]">
                    <p className="font-[TamdanRegular]">
                        <span className="font-[TamdanBold]">Address: </span>
                        Bridge 2, National Road 6A, Sangkat Prek Leap, Khan Chroy Changva, Phnom Penh
                    </p>
                    <p>
                        <span className=" font-[TamdanBold]">Email:</span>
                        tamdan.bycadtstudent@gmail.com
                    </p>
                </div>
                <Divider/>
                <div className="text-center justify-items-center">
                        <img src="/image/footerLogo.png" alt="Logo" className="h-auto w-auto"/>
                        <p>©2025 All Rights Reserved | Capstone 2, Group 4, Generation 9 of Cambodia Academy of Digital Techonology</p>

                </div>
            </div>
        </footer>
    )
}