resource "google_compute_network" "private_network" {
  provider     = google
  name         = "private-network"
  routing_mode = "REGIONAL"
}

resource "google_compute_global_address" "private_ip_address" {
  provider      = google
  name          = "private-ip-address"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.private_network.self_link
}
# Subnet for CloudRun VPC Connector
resource "google_compute_subnetwork" "cloudrun_connector_private_subnet" {
  name          = "cloudrun-connector-subnet-${var.region}"
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
