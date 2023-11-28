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
      }
    }

    metadata {
      annotations = {
        "autoscaling.knative.dev/maxScale"      = "3"
        "run.googleapis.com/cloudsql-instances" = "${var.project_id}:${var.region}:${google_sql_database_instance.cloud_sql.name}"
        "run.googleapis.com/client-name"        = "terraform"
      }
    }
  }

  autogenerate_revision_name = true
}

resource "random_string" "jwt_secret" {
  length           = 32
  override_special = "%*()-_=+[]{}?"
}
