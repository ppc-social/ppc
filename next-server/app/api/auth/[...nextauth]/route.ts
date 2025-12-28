import {buildNextAuthOptions} from '@/lib/auth';
import {getPPCSingelton} from '@ppc/parts';
import NextAuth from 'next-auth';

async function handler(req: any, res: any) {
  const ppc = getPPCSingelton()
  const options = buildNextAuthOptions(ppc)
  return NextAuth(req, res, options)
}

export {handler as GET, handler as POST}

