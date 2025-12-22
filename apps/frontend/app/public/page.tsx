export default async function HomePage() {
  const projects = await fetchProjects();

  return (
    <main>
      <Hero />
      <FeaturedProjects projects={projects} />
    </main>
  );
}
