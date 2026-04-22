'use client'
import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import Link from 'next/link'
import { FaArrowLeft } from 'react-icons/fa'
import Image from 'next/image'

export function AdsHome() {
  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 12,
    minutes: 45,
    seconds: 5
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 }
        } else if (prev.days > 0) {
          return { days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 }
        }
        return prev
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Format numbers to always show 2 digits
  const formatNumber = (num: number) => String(num).padStart(2, '0')

  return (
    <section className="bg-[#FDF2F8]">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10">
        
        {/* Left Content */}
        <div className="flex px-4 pb-5 sm:ps-[2%] md:ps-[4%] lg:ps-[10%] xl:ps-[13%] mx-auto flex-col gap-2 md:gap-[22px] w-full md:w-1/2 order-2 md:order-1">
          
          {/* Limited offer badge */}
          <p className="text-[12px] md:text-[16px] font-semibold py-1 px-3 text-[#BE4646]">
            لفتره محدودة
          </p>
          
          {/* Discount badge */}
          <div className="flex items-center gap-3">
            <p className="text-[20px] md:text-[32px] font-bold py-1 px-3  text-[#191C1F] w-fit rounded-md">
              خصم 32%
            </p>
          
          </div>
          

          <p className="text-sm md:text-[22px] text-[#191C1F] w-full md:w-[80%] leading-[1.5]">
            Lorem ipsum dolor sit amet consectetur.
          </p>
          
          {/* Countdown Timer */}
          <div className="mt-4">
            <p className="text-sm md:text-base text-gray-600 mb-3">سينتهي الخصم خلال</p>
            <div className="flex gap-3 md:gap-5">
             
            
             
              <div className="text-center">
                <div className="bg-white text-[#191C1F] rounded-lg px-2 py-1 md:px-4 md:py-2 min-w-[50px] md:min-w-[70px]">
                  <span className="text-xl md:text-3xl font-bold">{formatNumber(timeLeft.seconds)}</span>
                </div>
                <p className="text-[10px] md:text-xs text-gray-500 mt-1">Seconds</p>
              </div>
               <div className="text-center">
                <div className="bg-white text-[#191C1F] rounded-lg px-2 py-1 md:px-4 md:py-2 min-w-[50px] md:min-w-[70px]">
                  <span className="text-xl md:text-3xl font-bold">{formatNumber(timeLeft.minutes)}</span>
                </div>
                <p className="text-[10px] md:text-xs text-gray-500 mt-1">Minutes</p>
              </div>
                <div className="text-center">
                <div className="bg-white text-[#191C1F] rounded-lg px-2 py-1 md:px-4 md:py-2 min-w-[50px] md:min-w-[70px]">
                  <span className="text-xl md:text-3xl font-bold">{formatNumber(timeLeft.hours)}</span>
                </div>
                <p className="text-[10px] md:text-xs text-gray-500 mt-1">Hours</p>
              </div>
               <div className="text-center">
                <div className="bg-white text-[#191C1F] rounded-lg px-2 py-1 md:px-4 md:py-2 min-w-[50px] md:min-w-[70px]">
                  <span className="text-xl md:text-3xl font-bold">{formatNumber(timeLeft.days)}</span>
                </div>
                <p className="text-[10px] md:text-xs text-gray-500 mt-1">Days</p>
              </div>
            </div>
          </div>
          
          {/* Shop Button */}
          <Button
            asChild
            aria-label='buy now'
            className="w-full md:w-[180px] md:h-[60px] animate-in text-[12px] md:text-[16px] font-bold fade-in slide-in-from-bottom-5 duration-700 delay-200 rounded-xl mt-4"
            style={{ backgroundColor: '#08B2A7' }}
          >
            <Link href="#" className="flex items-center justify-center gap-2 text-white">
              تسوق الان
              <FaArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        {/* Right Image */}
        <div className="w-full md:w-1/2 md:ps-30 order-1 md:order-2">
          <Image 
            src="/images/advs.png" 
            alt="Advertisement" 
            className="w-full h-auto md:w-[100%] md:h-[532px] object-cover" 
            width={500} 
            height={300} 
            priority
          />
        </div>
        
      </div>
    </section>
  )
}