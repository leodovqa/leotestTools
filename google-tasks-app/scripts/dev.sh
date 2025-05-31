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
    if lsof -i :4000 > /dev/null 2>&1; then
        echo "Port 4000 is already in use. Please free up the port and try again."
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

# Function to check Node.js and npm
check_node_environment() {
    if ! command -v node &> /dev/null; then
        echo "Error: Node.js is not installed. Please install Node.js to use local development."
        exit 1
    fi

    if ! command -v npm &> /dev/null; then
        echo "Error: npm is not installed. Please install npm to use local development."
        exit 1
    fi
}

# Function to start Docker development
start_docker_dev() {
    echo
    echo "Starting Docker development environment..."
    echo "Note: This will not affect your local files or Git repository."
    echo
    docker-compose up --build
}

# Function to start local development
start_local_dev() {
    echo
    echo "Starting local development environment..."
    echo

    # Check Node.js environment
    check_node_environment

    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "Installing dependencies..."
        npm install
    fi

    # Start local development server
    PORT=4000 npm run dev
}

# Function to clean up
cleanup() {
    echo "Stopping development environment..."
    if [ "$1" = "docker" ]; then
        docker-compose down
    fi
    exit 0
}

# Set up trap for cleanup
trap 'cleanup $DEV_MODE' SIGINT SIGTERM

# Main script
echo "Starting development environment..."

# Run checks
check_docker
check_docker_compose
check_ports
check_git_status

echo
echo "Choose development mode:"
echo "1. Run with Docker (detached - terminal free for other commands)"
echo "2. Run with Docker (attached - see all logs in terminal)"
echo "3. Run without Docker (local development)"
echo

read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo "Starting Docker in detached mode..."
        docker-compose up -d
        echo
        echo "Docker is running in detached mode."
        echo "To view logs, run: docker-compose logs -f"
        echo "To stop Docker, run: docker-compose down"
        ;;
    2)
        echo "Starting Docker in attached mode..."
        docker-compose up
        ;;
    3)
        echo "Starting local development..."
        npm run dev
        ;;
    *)
        echo "Invalid choice. Please run the script again and select 1, 2, or 3."
        exit 1
        ;;
esac 