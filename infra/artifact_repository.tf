# Create Artifact Registry Repository for Docker containers
resource "google_artifact_registry_repository" "docker_image_repository" {
  provider = google

  location = var.region
  repository_id = var.repository
  description = "Docker image repository"
  format = "DOCKER"
  depends_on =[google_project_service.artifactregistry]
}