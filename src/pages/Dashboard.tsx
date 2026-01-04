import { Container, DashboardComponent } from "../components";
import { FolderProvider } from "../components/dashboard/context/FolderProvider";

function Dashboard() {
  return (
    <Container>
      <FolderProvider>
        <DashboardComponent />
      </FolderProvider>
    </Container>
  );
}

export default Dashboard;
