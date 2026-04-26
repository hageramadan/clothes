import { AdsHome } from "@/components/home/AdsHome";
import { AdsHome1 } from "@/components/home/AdsHome1";
import { BestProducts } from "@/components/home/BestProducts";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { Hero } from "@/components/home/HeroCover";
import { LatestProducts, } from "@/components/home/LatestProducts";
import { LatestProducts2 } from "@/components/home/LatestProducts2";
import { Footer } from "@/components/layout/Footer";



export default function Home() {
  return (
   <div>
    <Hero />
    <CategoriesSection />
   <LatestProducts />
   <AdsHome1/>
   <BestProducts/>
   <AdsHome/>
   
   <BestProducts/>
   <Footer />
   </div>
  );
}
