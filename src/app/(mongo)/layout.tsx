import '../../styles/globals.scss'
import { inter, orbitron } from '@/app/fonts';
import { cookies } from 'next/headers';
import MongoClientRoot from './mongo/components/MongoClientRoot';

export default async function MongoLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const status = process.env.NEXT_CLIENT_STATUS;
  const cookieStore = await cookies();
  const hasAuthCookie = cookieStore.get('mongo_auth')?.value === '1';
  const mustAskPassword = status === 'prod' && !hasAuthCookie;

  return (
    <html lang="ru" className={`${inter.variable} ${orbitron.variable}`}>
      <body className={inter.className}>
        <MongoClientRoot mustAskPassword={mustAskPassword}>
          {children}
        </MongoClientRoot>
      </body>
    </html>
  );
}


