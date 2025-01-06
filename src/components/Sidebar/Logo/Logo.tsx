import { useTheme } from 'next-themes';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import Image from 'next/image'

const Logo: React.FC<{small: boolean}> = ({small}) => {

    const { theme } = useTheme()
  
    const [logoSrc, setLogoSrc] = useState('/logoFull_lightMode.svg');
  
    const getLogoSrc = () =>
      small ? './logoSmall.svg' : (
        theme === 'dark'
        ? './logoFull_darkMode.svg'
        : './logoFull_lightMode.svg'
      )
  
    // Меняем лого после перезагрузки страницы
    useEffect(() => {
      setLogoSrc(getLogoSrc());
    }, [theme, small]);
  
    const getLogoSize = () => (small ? { width: 120, height: 0 } : { width: 230, height: 0 });
  

  return (
    <div style={{ margin: '5px 0 10px 0' }}>
        <Link key={4} href={"/"}>
            <Image src={logoSrc} alt="Логотип" {...getLogoSize()} />
        </Link>
    </div>
  )
}

export default Logo
