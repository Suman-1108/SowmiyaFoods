import React from 'react'
import Navbar from '../components/Navbar'
import CategoryNavbar from '../components/home/CategoryNavbar'
import Carousel from '../components/home/Carousel'
import FeaturedCollections from '../components/home/FeaturedCollections'
import TextMarquee from '../components/home/TextMarquee'
import Slider from '../components/home/Slider'
import WhyChooseUs from '../components/home/WhyChooseUs'
import CTASection from '../components/home/CTASection'
import LatestProducts from '../components/home/LatestProducts'
import TrendingProducts from '../components/home/TrendingProducts'
import ProductRangeCarousel from '../components/home/ProductRangeCarousel'
import TestimonialVideoCarousel from '../components/home/TestimonialVideoCarousel'
import DiwaliPopup from '../components/home/DiwaliPopup'
import Footer from '../components/Footer'

const Home = () => {
  return (
    <div>
        <DiwaliPopup />
        <Navbar />
        <CategoryNavbar />
        <Carousel />
        <TextMarquee />
        <ProductRangeCarousel />
        <Slider />
        <FeaturedCollections />
        <LatestProducts />
        <TrendingProducts />
        <WhyChooseUs />
        <TestimonialVideoCarousel />
        <CTASection />
        <Footer />
    </div>
  )
}

export default Home
