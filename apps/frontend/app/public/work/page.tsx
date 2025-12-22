export default async function WorkPage() {
  const work = await getExternalWork();

  return <WorkGrid items={work} />;
}
