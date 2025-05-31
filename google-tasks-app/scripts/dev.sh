#!/bin/bash

# Change to the project directory (where the script is located)
cd "$(dirname "$0")/.."

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to check if docker-compose is installed
check_docker_compose() {
    if ! docker-compose version > /dev/null 2>&1; then
        echo "docker-compose is not installed. Please install it and try again."
        exit 1
    fi
}

# Function to check if ports are available
check_ports() {
    if lsof -i :3000 > /dev/null 2>&1; then
        echo "Port 3000 is already in use. Please free up the port and try again."
        exit 1
    fi
}

# Function to check for uncommitted changes
check_git_status() {
    if ! git diff-index --quiet HEAD --; then
        echo "Warning: You have uncommitted changes in your repository."
        echo "This is safe to continue, but make sure to commit your changes when ready."
        echo
        read -p "Do you want to continue? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Function to clean up containers
cleanup() {
    echo "Stopping containers..."
    docker-compose down
    exit 0
}

# Set up trap for cleanup
trap cleanup SIGINT SIGTERM

# Main script
echo "Starting development environment..."

# Run checks
check_docker
check_docker_compose
check_ports
check_git_status

echo "Building and starting containers..."
echo "Note: This will not affect your local files or Git repository."
echo

# Build and start containers
docker-compose up --build

# Keep script running
wait 