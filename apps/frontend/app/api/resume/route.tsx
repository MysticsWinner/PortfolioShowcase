import { NextRequest, NextResponse } from 'next/server';
import { Document, Page, Text, View, StyleSheet, renderToStream } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { flexDirection: 'column', backgroundColor: '#ffffff', padding: 40 },
  header: { fontSize: 28, marginBottom: 5, textAlign: 'center', color: '#111', fontWeight: 'bold' },
  subheader: { fontSize: 12, marginBottom: 20, textAlign: 'center', color: '#666' },
  section: { marginTop: 15, marginBottom: 15 },
  title: { fontSize: 16, borderBottom: '1pt solid #ccc', paddingBottom: 5, marginBottom: 10, color: '#333', textTransform: 'uppercase' },
  text: { fontSize: 11, marginBottom: 6, color: '#444', lineHeight: 1.4 },
  boldText: { fontSize: 11, color: '#111', fontWeight: 'bold' }
});

const ResumeDocument = ({ name, email }: { name: string, email: string }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>{name}</Text>
      <Text style={styles.subheader}>{email}</Text>
      
      <View style={styles.section}>
        <Text style={styles.title}>Professional Summary</Text>
        <Text style={styles.text}>A highly driven full-stack architect specialized in Next.js Server Components, NestJS Microservices, and strict PostgreSQL transactional data flows. Proven track record of fortifying platform security via custom AES-256 encryption at rest and raw JWT interceptors.</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.title}>Experience</Text>
        <Text style={styles.boldText}>Lead Architect - Portfolio Showcase Co.</Text>
        <Text style={styles.text}>• Engineered a zero-bundle-size impact Next.js 14 App Router frontend featuring dynamic OpenGraph and static blog MDX generation.</Text>
        <Text style={styles.text}>• Built custom OTP generation logic routed through local SMTP transports alongside robust React hydration mitigation methodologies.</Text>
        <Text style={styles.text}>• Integrated deeply custom Tailwind Framer Motion micro-animations.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Core Competencies</Text>
        <Text style={styles.text}>Languages: TypeScript, JavaScript (ES6+), SQL, Python</Text>
        <Text style={styles.text}>Frameworks: Next.js 14, React 19, NestJS 11, Tailwind CSS</Text>
        <Text style={styles.text}>Databases & Tools: PostgreSQL, Prisma ORM, PNPM Workspaces, Jest, GitHub Actions, Framer Motion</Text>
      </View>
    </Page>
  </Document>
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name');
    const email = searchParams.get('email');

    if (!name || !email) {
      return NextResponse.json({ error: 'Unauthorized. Missing authentication parameters.' }, { status: 401 });
    }

    const stream = await renderToStream(<ResumeDocument name={name} email={email} />);
    
    // Read the stream into a buffer for direct HTTP Transmission
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const pdfBuffer = Buffer.concat(chunks);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="professional_resume.pdf"',
      },
    });
  } catch (error) {
    console.error('PDF Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF document.' }, { status: 500 });
  }
}
