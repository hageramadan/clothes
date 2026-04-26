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
    <section className="bg-[#141718] overflow-hidden">
      {/* تغيير flex-col إلى flex-row على جميع الشاشات */}
      <div className="flex flex-row items-center justify-between gap-2 md:gap-10">
        
        {/* Left Content - text smaller on mobile */}
        <div className="flex px-3 py-4 sm:ps-[2%] md:ps-[4%] lg:ps-[10%] xl:ps-[13%] mx-auto flex-col gap-1 md:gap-[22px] w-1/2 order-1">
          
          {/* Limited offer badge - smaller text on mobile */}
          <p className="text-[8px] md:text-right md:text-[16px] font-semibold py-0.5 px-1.5 md:px-3 text-[#BE4646] text-center md:text-right">
            لفتره محدودة
          </p>
          
          {/* Discount badge - smaller on mobile */}
          <div className="flex items-center gap-2 md:gap-3 md:justify-start justify-center">
            <p className="text-[12px] md:text-[32px] font-bold py-0.5 px-1.5 md:px-3 text-[#FFF5F4] w-fit rounded-md text-center">
              خصم 32%
            </p>
          </div>
          
          {/* Description - smaller on mobile */}
          <p className="text-[8px] text-center md:text-right md:text-[22px] text-[#FFF5F4] w-full md:w-[80%] leading-[1.3] md:leading-[1.5]">
            Lorem ipsum dolor sit amet consectetur.
          </p>
          
          {/* Countdown Timer - smaller on mobile */}
          <div className="mt-1 md:mt-4">
            <p className="text-[6px] text-center md:text-right md:text-base text-gray-300 mb-1 md:mb-3">سينتهي الخصم خلال</p>
            <div className="flex justify-center md:justify-start gap-1.5 md:gap-5">
              {/* Days */}
              <div className="text-center">
                <div className="bg-white text-[#191C1F] rounded-lg px-1 py-0.5 md:px-4 md:py-2 min-w-[35px] md:min-w-[70px]">
                  <span className="text-[10px] md:text-3xl font-bold">{formatNumber(timeLeft.days)}</span>
                </div>
                <p className="text-[6px] md:text-xs text-gray-500 mt-0.5 md:mt-1">أيام</p>
              </div>
              
              {/* Hours */}
              <div className="text-center">
                <div className="bg-white text-[#191C1F] rounded-lg px-1 py-0.5 md:px-4 md:py-2 min-w-[35px] md:min-w-[70px]">
                  <span className="text-[10px] md:text-3xl font-bold">{formatNumber(timeLeft.hours)}</span>
                </div>
                <p className="text-[6px] md:text-xs text-gray-500 mt-0.5 md:mt-1">ساعات</p>
              </div>
              
              {/* Minutes */}
              <div className="text-center">
                <div className="bg-white text-[#191C1F] rounded-lg px-1 py-0.5 md:px-4 md:py-2 min-w-[35px] md:min-w-[70px]">
                  <span className="text-[10px] md:text-3xl font-bold">{formatNumber(timeLeft.minutes)}</span>
                </div>
                <p className="text-[6px] md:text-xs text-gray-500 mt-0.5 md:mt-1">دقائق</p>
              </div>
              
              {/* Seconds */}
              <div className="text-center">
                <div className="bg-white text-[#191C1F] rounded-lg px-1 py-0.5 md:px-4 md:py-2 min-w-[35px] md:min-w-[70px]">
                  <span className="text-[10px] md:text-3xl font-bold">{formatNumber(timeLeft.seconds)}</span>
                </div>
                <p className="text-[6px] md:text-xs text-gray-500 mt-0.5 md:mt-1">ثواني</p>
              </div>
            </div>
          </div>
          
          {/* Shop Button - smaller on mobile */}
          <Button
            asChild
            aria-label='buy now'
            className="w-full md:w-[180px] md:h-[60px] animate-in text-[8px] md:text-[16px]
             font-bold fade-in slide-in-from-bottom-5 duration-700 delay-200 rounded-xl mt-1 md:mt-4"
            style={{ backgroundColor: '#EC221F' }}
          >
            <Link href="#" className="flex items-center justify-center gap-1 md:gap-2 text-white">
              تسوق الان
              <FaArrowLeft className="h-2 w-2 md:h-4 md:w-4" />
            </Link>
          </Button>
        </div>
        
        {/* Right Image - smaller on mobile */}
        <div className="w-1/2 md:w-1/2 md:ps-30 order-2">
          <Image 
            src="/images/sale.png" 
            alt="Advertisement" 
            className="w-full h-auto md:w-[100%] md:h-[532px] object-cover" 
            width={500} 
            height={300} 
            style={{ objectPosition: 'center 0%' }}
            priority
          />
        </div>
        
      </div>
    </section>
  )
}