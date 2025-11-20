import prisma from './src/lib/prisma';

async function checkRecording() {
  const session = await prisma.fundingPaymentRecordingSession.findUnique({
    where: { id: 'cmi4iuppp006ow51gxc9vakpl' }
  });

  console.log('='.repeat(60));
  console.log('KUCOIN Recording Session Details');
  console.log('='.repeat(60));
  console.log('Symbol:', session?.symbol);
  console.log('Exchange:', session?.exchange);
  console.log('Status:', session?.status);
  console.log('Created:', session?.createdAt);
  console.log('Funding Rate:', session?.fundingRate);
  console.log('Funding Payment Time:', session?.fundingPaymentTime);
  console.log('Pre-Recording Seconds:', session?.preRecordingSeconds);
  console.log('Post-Recording Seconds:', session?.postRecordingSeconds);
  console.log('='.repeat(60));
  console.log('Current Time:', new Date());

  if (session?.fundingPaymentTime) {
    const msUntil = session.fundingPaymentTime.getTime() - Date.now();
    const minutesUntil = Math.floor(msUntil / 60000);
    console.log('Minutes until funding:', minutesUntil);
    console.log('Recording should be active:', minutesUntil < 1 && minutesUntil > -2);
  }
  console.log('='.repeat(60));

  await prisma.$disconnect();
}

checkRecording();
