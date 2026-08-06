import Navbar from "../../components/Navbar";
import Hero from "../../components/Hero";
import SearchBar from "../../components/SearchBar";
import FeaturedJobs from "../../components/FeaturedJobs";
import Stats from "../../components/Stats";
import Footer from "../../components/Footer";

function Home() {
  return (
   <>
      <Navbar />
      <Hero />
      <SearchBar />
      <FeaturedJobs />
      <Stats />
      <Footer />
    </>
  );
}

export default Home;