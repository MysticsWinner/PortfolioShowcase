package main

import (
	"fmt"
	"net/http"
	"os"
	"time"
)

func main() {
	url := os.Getenv("HEALTH_CHECK_URL")
	if url == "" {
		url = "http://localhost:3000/api/health"
	}

	client := &http.Client{
		Timeout: 5 * time.Second,
	}

	fmt.Printf("Pinging %s...\n", url)
	resp, err := client.Get(url)
	if err != nil {
		fmt.Printf("Healthcheck failed: %v\n", err)
		os.Exit(1)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusOK {
		fmt.Println("Service is healthy!")
	} else {
		fmt.Printf("Service returned unexpected status code: %d\n", resp.StatusCode)
		os.Exit(1)
	}
}
