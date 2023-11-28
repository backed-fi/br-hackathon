variable "project_id" {
  type    = string
  default = "br-hackathon-406413"
}

variable "name" {
  type = string
  default = "br-hhackathon"
}

variable "region" {
  type    = string
  default = "europe-west2"
}

variable "repository" {
  description = "The name of the Artifact Registry repository to be created"
  type        = string
  default     = "docker-repository"
}