resource "docker_network" "gearflow" {
  name = "gearflow"
}

resource "docker_volume" "mysql_data" {
  name = "gearflow_mysql_data"
}

output "compose_command" {
  value = "docker compose --env-file .env up --build -d"
}
