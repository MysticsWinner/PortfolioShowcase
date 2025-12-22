export default async function AdminProjectsPage() {
  const projects = await getPrivateProjects();
  return <AdminProjectTable projects={projects} />;
}
