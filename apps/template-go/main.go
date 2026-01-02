package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"

	"connectrpc.com/connect"
	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"

	// Import generated code
	pingv1 "github.com/LuciKritZ/syzygium/libs/protos/gen/go/infrastructure/v1"
	"github.com/LuciKritZ/syzygium/libs/protos/gen/go/infrastructure/v1/v1connect"
)

type PingServer struct{}

func (s *PingServer) Ping(
	ctx context.Context,
	req *connect.Request[pingv1.PingRequest],
) (*connect.Response[pingv1.PingResponse], error) {
	log.Printf("Received ping: %s", req.Msg.Message)

	res := connect.NewResponse(&pingv1.PingResponse{
		Message:    "Pong: " + req.Msg.Message,
		ServerTime: time.Now().String(),
	})
	return res, nil
}

func main() {
	mux := http.NewServeMux()

	// Register the handler
	path, handler := v1connect.NewPingServiceHandler(&PingServer{})
	mux.Handle(path, handler)

	apiPrefix := "/api/infrastructure/v1"

	mux.Handle(apiPrefix+"/", http.StripPrefix(apiPrefix, handler))

	// Enable CORS (So React can talk to it)
	// In production, use a real middleware library like 'rs/cors'
	corsHandler := func(h http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Connect-Protocol-Version")
			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}
			h.ServeHTTP(w, r)
		})
	}

	address := "localhost:8090"
	fmt.Printf("Server listening on http://%s%s\n", address, apiPrefix)

	// Use h2c so we can support HTTP/2 without TLS (for local dev)
	err := http.ListenAndServe(
		address,
		h2c.NewHandler(corsHandler(mux), &http2.Server{}),
	)
	if err != nil {
		log.Fatal(err)
	}
}
