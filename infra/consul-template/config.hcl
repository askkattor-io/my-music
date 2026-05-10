consul {
  address = "localhost:8500"

  retry {
    enabled  = true
    attempts = 12
    backoff  = "250ms"
  }
}
template {
  source      = "/Users/emilarnaudov/Documents/personal/my-music/infra/consul-template/upstreams.conf.ctmpl"
  destination = "/Users/emilarnaudov/Documents/personal/my-music/infra/nginx/upstreams.conf"

  perms       = 0600
  command     = "nginx -s reload -c /Users/emilarnaudov/Documents/personal/my-music/infra/nginx/nginx.conf"
}
