resource "google_sql_database_instance" "cloud_sql" {
  name             = "${var.name}-sql"
  provider    = google
  database_version = "POSTGRES_14"
  region           = var.region
  deletion_protection = true
  
  settings {
    tier = "db-f1-micro"
    user_labels = {
      name        = "${var.name}-sql"
      tier = "database"
      type = "postgres"
    }
    ip_configuration {
      ipv4_enabled    = true
      require_ssl = false
      private_network = google_compute_network.private_network.self_link
    }
  }
}

resource "random_string" "root_password" {
  length           = 16
  override_special = "%*()-_=+[]{}?"
}

resource "google_sql_user" "root" {
  name     = "root"
  instance = google_sql_database_instance.cloud_sql.name
  password = random_string.root_password.result
}

# Creates secret for storing DATABASE_PASSWORD
resource "google_secret_manager_secret" "database_password" {
  secret_id = "DATABASE_PASSWORD"
   replication {
    auto {}
  }
  lifecycle {
    ignore_changes = [secret_id]
  }

  depends_on = [ google_project_service.secretmanager ]
}

# Stores database ssl client cert in a secret
resource "google_secret_manager_secret_version" "main_db_ssl_client_cert_version" {
  secret                = google_secret_manager_secret.database_password.id
  secret_data           = random_string.root_password.result

  depends_on = [google_sql_user.root]
}