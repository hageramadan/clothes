
import { AdsSection } from "@/components/home/AdsSection";
import { BestProducts } from "@/components/home/BestProducts";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { Hero } from "@/components/home/HeroCover";
import { LatestProducts, } from "@/components/home/LatestProducts";
import { SectionProducts } from "@/components/home/SectionProducts";




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
   <SectionProducts/>
   </div>
  );
}
