import pdf from 'pdf-parse';
import https from 'https';

https.get('https://res.cloudinary.com/dudbwcacf/image/upload/v1773429415/resumes/resume_1773429415088.pdf', (res) => {
  const bufs = [];
  res.on('data', chunk => { bufs.push(chunk); });
  res.on('end', async () => {
    try {
      const buffer = Buffer.concat(bufs);
      console.log('Downloaded Buffer length:', buffer.length);
      const data = await pdf(buffer);
      console.log('Extracted Text length:', data.text.length);
      console.log('Sample text:', data.text.substring(0, 100));
    } catch (e) {
      console.error('PDF Parse Error:', e.message);
    }
  });
});
