import prisma from './src/lib/prisma';

async function checkRecording() {
  const session = await prisma.fundingPaymentRecordingSession.findUnique({
    where: { id: 'cmi4iuppp006ow51gxc9vakpl' }
  });

  console.log('Symbol:', session?.symbol);
  console.log('Exchange:', session?.exchange);
  console.log('Status:', session?.status);
  console.log('Created:', session?.createdAt);

  await prisma.$disconnect();
}

checkRecording();
