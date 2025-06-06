#!/bin/bash

echo "Checking for processes using ports 3000 and 4000..."
echo "WARNING: This will only kill processes using ports 3000 and 4000."
echo "If you have other applications using these ports, they will be stopped."
echo
read -p "Press Enter to continue or Ctrl+C to cancel..."

# Function to kill process on a specific port
kill_port() {
    local port=$1
    local pid=$(lsof -ti :$port -sTCP:LISTEN)
    
    if [ ! -z "$pid" ]; then
        echo "Found process using port $port with PID: $pid"
        echo "Attempting to kill process..."
        kill -9 $pid
        if [ $? -eq 0 ]; then
            echo "Successfully killed process on port $port"
        else
            echo "Failed to kill process on port $port"
        fi
    else
        echo "No process found using port $port"
    fi
}

# Check and kill processes on port 3000
kill_port 3000

# Check and kill processes on port 4000
kill_port 4000

echo
echo "Port cleanup complete."
echo "You can now run the development script." 