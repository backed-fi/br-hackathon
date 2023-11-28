resource "google_project_service" "iam" {
  provider = google
  service            = "iam.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "secretmanager" {
  provider = google
  service = "secretmanager.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "servicenetworking" {
  provider = google
  service = "servicenetworking.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "artifactregistry" {
  provider = google
  service            = "artifactregistry.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "cloudrun" {
  provider = google
  service            = "run.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "vpcaccess" {
  provider = google
  project = var.project_id
  service = "vpcaccess.googleapis.com"
}

resource "google_project_service" "sqladmin" {
  provider = google
  project = var.project_id
  service = "sqladmin.googleapis.com"
}
