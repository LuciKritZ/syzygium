package graph

import (
	"net/http"

	"github.com/LuciKritZ/syzygium/libs/protos/gen/go/infrastructure/v1/v1connect"
)

type Registry struct {
	PingClient v1connect.PingServiceClient
	// Add AuthClient, ProjectClient, etc. here later
}

func NewRegistry() *Registry {
	return &Registry{
		PingClient: v1connect.NewPingServiceClient(
			http.DefaultClient,
			"http://localhost:8090/api/infrastructure/v1",
		),
	}
}
