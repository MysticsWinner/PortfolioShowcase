export default async function ProjectsPage() {
  const projects = await getProjects();

  return <ProjectGrid projects={projects} />;
}
