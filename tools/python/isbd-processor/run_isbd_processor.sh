#!/bin/bash
# run_isbd_processor.sh - Convenient script to run the ISBD processor

# Change to the script directory
cd /Users/jonphipps/Code/IFLA/standards-dev/tools/python/isbd-processor

# Activate virtual environment if it exists
if [ -d ".venv" ]; then
    source .venv/bin/activate
elif [ -d "venv" ]; then
    source venv/bin/activate
else
    echo "No virtual environment found. Creating one with uv..."
    uv venv
    uv pip install -r pyproject.toml
    source .venv/bin/activate
fi

# Check if data files exist
if [ ! -f "data/elements.csv" ]; then
    echo "Error: data/elements.csv not found"
    echo "Please copy your elements.csv file to the data/ directory"
    exit 1
fi

if [ ! -f "data/isbd.pdf" ]; then
    echo "Error: data/isbd.pdf not found"
    echo "Please copy your isbd.pdf file to the data/ directory"
    exit 1
fi

# Check for API key
if [ -z "$GEMINI_API_KEY" ] && [ ! -f ".env" ]; then
    echo "Error: No API key found"
    echo "Please either:"
    echo "  1. Create a .env file with: GEMINI_API_KEY=your-key-here"
    echo "  2. Export it: export GEMINI_API_KEY=your-key-here"
    exit 1
fi

# Run the processor
echo "Starting ISBD processor..."
echo "Output will be saved to: /Users/jonphipps/Code/IFLA/standards-dev/standards/isbd/docs/elements/isbd/"
echo ""

python gemini_isbd_processor.py data/elements.csv data/isbd.pdf

echo ""
echo "Processing complete!"
echo "Check the output directory for generated MDX files."
