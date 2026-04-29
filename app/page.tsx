import { AdsHome } from "@/components/home/AdsHome";
import { AdsHome1 } from "@/components/home/AdsHome1";
import { AdsSection } from "@/components/home/AdsSection";
import { BestProducts } from "@/components/home/BestProducts";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { Hero } from "@/components/home/HeroCover";
import { LatestProducts, } from "@/components/home/LatestProducts";
import { Footer } from "@/components/layout/Footer";



export default function Home() {
  return (
   <div>
    <Hero />
    <CategoriesSection />
   <LatestProducts />
   {/* <AdsHome1/> */}
   <AdsSection variant="light" /> 
   <BestProducts/>
   {/* <AdsHome/>    */}
   <AdsSection variant="dark" /> 
   <BestProducts/>
   <Footer />
   </div>
  );
}
