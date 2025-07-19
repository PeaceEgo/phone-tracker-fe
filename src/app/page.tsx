import Header from "@/components/header";
import Image from "next/image";

const LandingPage = () => {
  return (
    <div className="min-h-screen text-white relative bg-gradient-to-r from-blue-800 to-black">
      <div
        className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-30"
        style={{ backgroundImage: 'url(/signup-bg.jpg)' }}
      ></div>
      <Header />
      <div className="w-full max-w-6xl relative z-10 flex flex-col justify-center mt-20 ">
       
          <h1 className="text-4xl font-bold mb-4 text-center">Phone Tracking App</h1>
          <p className="text-xl text-gray-200 text-center">The most powerful phone monitoring software on the planet. You deserve a monitoring app for parental control that keeps up with tomorrow's technology.</p>
       
        {/* <div className="w-1/2 pl-12">
          <Image
            src="/top.png"
            alt="Phone Tracking App"
            width={800}
            height={600}
            className="mx-auto rounded-lg shadow-lg"
          />
        </div> */}
      </div>
    </div>
  );
};

export default LandingPage;