terraform {
  backend "gcs" {
    bucket = "br-hackathon-terraform-bucket" # GCS bucket name to store terraform tfstate
  }
}