#!/usr/bin/env python3
"""
WaitingForInput Hook - Plays a sound when Claude is waiting for user input
"""

import subprocess
import os
import sys
import re

def play_sound(sound_name):
    """Play a system sound on macOS"""
    try:
        # Use afplay (Audio File Player) which is built into macOS
        subprocess.run(['afplay', f'/System/Library/Sounds/{sound_name}.aiff'], 
                      capture_output=True, text=True, timeout=2)
    except Exception as e:
        # Silently fail if sound can't play
        pass

def check_for_waiting_indicators(message):
    """Check if the message indicates waiting for input"""
    waiting_patterns = [
        r'(?i)(what would you like|how can I help|what.*next)',
        r'(?i)(waiting for|need.*input|please provide)',
        r'(?i)(would you like me to|should I)',
        r'(?i)(let me know|tell me|please specify)',
        r'(?i)(which.*would you prefer|what.*prefer)',
        r'\?$',  # Ends with a question mark
        r'(?i)(ready to|ready for|awaiting)',
        r'(?i)(need more information|need.*clarification)',
    ]
    
    # Check for waiting/question patterns
    for pattern in waiting_patterns:
        if re.search(pattern, message):
            return True
    
    return False

def main():
    # Read the message from stdin or arguments
    if len(sys.argv) > 1:
        message = ' '.join(sys.argv[1:])
    else:
        message = sys.stdin.read()
    
    # Check if this appears to be waiting for input
    if check_for_waiting_indicators(message):
        # Play a subtle notification sound
        # Pop = gentle attention sound
        # Ping = slightly more noticeable
        play_sound('Pop')
    
    # Always exit successfully to not interrupt Claude
    sys.exit(0)

if __name__ == "__main__":
    main()