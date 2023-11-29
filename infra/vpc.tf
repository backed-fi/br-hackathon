resource "google_compute_network" "private_network" {
  provider     = google
  name         = "private-network"
  routing_mode = "REGIONAL"
}


# Cloud SQL private network
resource "google_compute_global_address" "cloudsql_reserved_ip_range" {
  name          = "${var.name}-sql-private-${var.region}"
  address       = "10.1.0.0"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 20
  network       = google_compute_network.private_network.id
}

resource "google_service_networking_connection" "private_vpc_connection" {
    provider= google
    network       = "${google_compute_network.private_network.self_link}"
    service       = "servicenetworking.googleapis.com"
    reserved_peering_ranges = ["${google_compute_global_address.cloudsql_reserved_ip_range.name}"]
}


# Subnet for CloudRun VPC Connector
resource "google_compute_subnetwork" "cloudrun_connector_private_subnet" {
  name          = "${var.name}-cloudrun-connector-subnet-${var.region}"
  ip_cidr_range = "10.2.0.0/28"
  region        = var.region
  network       = google_compute_network.private_network.id

  log_config {
    aggregation_interval = "INTERVAL_1_MIN"
    flow_sampling        = 0.5
    metadata             = "INCLUDE_ALL_METADATA"
  }
}

# VPC Connector for CloudRun to be able to access Private CloudSQL instance
resource "google_vpc_access_connector" "connector" {
  name = "cloudrun-connect"
  subnet {
    name = google_compute_subnetwork.cloudrun_connector_private_subnet.name
  }
  machine_type  = "f1-micro"
  min_instances = 2
  max_instances = 3

  depends_on = [ google_project_service.vpcaccess ]
}
