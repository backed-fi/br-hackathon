resource "google_cloud_run_service" "backend" {
  name     = "backend"
  location = var.region

  template {
    spec {
      containers {
        image = var.docker_image

        ports {
          container_port = 3001
        }

        env {
          name  = "DATABASE_HOST"
          value = "${google_sql_database_instance.cloud_sql.private_ip_address}"
        }
        env {
          name  = "DATABASE_PORT"
          value = 5432
        }
        env {
          name  = "DATABASE_NAME"
          value = "br-hackathon"
        }
        env {
          name  = "DATABASE_USER"
          value = "root"
        }
        env {
          name  = "DATABASE_PASSWORD"
          value = "${google_sql_user.root.password}"
        }
        env {
          name  = "JWT_EXPIRE"
          value = "15m"
        }
        env {
          name  = "JWT_SECRET"
          value = "${random_string.jwt_secret.result}"
        }
        env {
          name = "MIKRO_ORM_MIGRATIONS_DISABLE_FOREIGN_KEYS"
          value = false
        }
        env {
          name = "ALLOWED_ORIGINS"
          value = "https://br-hackathon-406413.web.app;https://br-hackathon-406413.firebaseapp.com"
        }
      }
    }

    metadata {
      annotations = {
        "autoscaling.knative.dev/maxScale"      = "3"
        "run.googleapis.com/cloudsql-instances" = "${var.project_id}:${var.region}:${google_sql_database_instance.cloud_sql.name}"
        "run.googleapis.com/client-name"        = "terraform",
        "run.googleapis.com/vpc-access-connector" = "${google_vpc_access_connector.connector.self_link}"
      }
    }
  }

  depends_on = [ google_sql_database_instance.cloud_sql ]

  autogenerate_revision_name = true
}

resource "random_string" "jwt_secret" {
  length           = 32
  override_special = "%*()-_=+[]{}?"
}

data "google_iam_policy" "noauth" {
  binding {
    role = "roles/run.invoker"
    members = [
      "allUsers",
    ]
  }
}

resource "google_cloud_run_service_iam_policy" "noauth" {
  location    = google_cloud_run_service.backend.location
  project     = google_cloud_run_service.backend.project
  service     = google_cloud_run_service.backend.name
  policy_data = data.google_iam_policy.noauth.policy_data
}

