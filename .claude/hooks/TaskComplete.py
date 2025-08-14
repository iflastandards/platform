#!/usr/bin/env python3
"""
TaskComplete Hook - Plays a sound when Claude completes a task
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

def check_for_completion_indicators(message):
    """Check if the message indicates task completion"""
    completion_patterns = [
        r'✅',  # Checkmark emoji
        r'(?i)(done|complete[d]?|finish[ed]?|success)',
        r'(?i)(fixed|resolved|implemented|created|updated|added)',
        r'(?i)(all tests pass)',
        r'(?i)(committed|pushed|deployed)',
        r'(?i)(saved|wrote|generated)',
    ]
    
    # Check for completion patterns
    for pattern in completion_patterns:
        if re.search(pattern, message):
            return True
    
    # Check for completed todos
    if '"status":"completed"' in message:
        return True
    
    return False

def main():
    # Read the message from stdin or arguments
    if len(sys.argv) > 1:
        message = ' '.join(sys.argv[1:])
    else:
        message = sys.stdin.read()
    
    # Check if this appears to be a task completion
    if check_for_completion_indicators(message):
        # Play a pleasant completion sound
        # Glass = subtle completion sound
        # Hero = more prominent completion sound
        play_sound('Glass')
    
    # Always exit successfully to not interrupt Claude
    sys.exit(0)

if __name__ == "__main__":
    main()