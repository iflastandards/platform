#!/usr/bin/env python3
"""
SoundNotifications Hook - Plays appropriate sounds based on Claude's state
Combines task completion and waiting for input notifications
"""

import subprocess
import os
import sys
import re
import json

def play_sound(sound_name, volume=0.5):
    """Play a system sound on macOS with optional volume control"""
    try:
        # Use afplay (Audio File Player) which is built into macOS
        cmd = ['afplay']
        if volume != 1.0:
            cmd.extend(['-v', str(volume)])
        cmd.append(f'/System/Library/Sounds/{sound_name}.aiff')
        
        subprocess.run(cmd, capture_output=True, text=True, timeout=2)
    except Exception as e:
        # Silently fail if sound can't play
        pass

def check_message_type(message):
    """Determine the type of message and appropriate sound"""
    
    # Task completion patterns - higher priority
    completion_patterns = [
        (r'✅.*[Cc]ompleted|✅.*[Dd]one|✅.*[Ff]ixed', 'Glass', 0.6),  # Clear completion
        (r'(?i)successfully (created|updated|implemented|deployed)', 'Hero', 0.4),  # Major success
        (r'(?i)(all tests pass|build succeed)', 'Glass', 0.5),  # Test/build success
        (r'(?i)committed.*successfully', 'Morse', 0.5),  # Git commit
        (r'"status":"completed"', 'Pop', 0.4),  # Todo completion
        (r'(?i)^done\.?$|^fixed\.?$|^completed\.?$', 'Glass', 0.5),  # Simple completion
    ]
    
    # Error or warning patterns
    error_patterns = [
        (r'(?i)(error|failed|failure|exception)', 'Sosumi', 0.4),  # Error sound
        (r'⚠️|(?i)warning', 'Tink', 0.3),  # Warning sound
    ]
    
    # Waiting for input patterns - lower priority
    waiting_patterns = [
        (r'(?i)would you like me to|should I', 'Pop', 0.3),  # Question needing answer
        (r'(?i)which.*prefer|what.*prefer', 'Pop', 0.3),  # Choice needed
        (r'(?i)please (provide|specify|tell me)', 'Ping', 0.3),  # Request for info
        (r'\?$', 'Pop', 0.2),  # Ends with question mark
    ]
    
    # Check patterns in priority order
    for pattern, sound, volume in completion_patterns:
        if re.search(pattern, message):
            return ('completion', sound, volume)
    
    for pattern, sound, volume in error_patterns:
        if re.search(pattern, message):
            return ('error', sound, volume)
    
    for pattern, sound, volume in waiting_patterns:
        if re.search(pattern, message):
            return ('waiting', sound, volume)
    
    return (None, None, None)

def get_config():
    """Load user configuration if it exists"""
    config_path = os.path.expanduser('~/.claude/sound_config.json')
    default_config = {
        'enabled': True,
        'completion_sound': 'Glass',
        'waiting_sound': 'Pop',
        'error_sound': 'Sosumi',
        'volume': 0.5
    }
    
    try:
        if os.path.exists(config_path):
            with open(config_path, 'r') as f:
                user_config = json.load(f)
                default_config.update(user_config)
    except:
        pass
    
    return default_config

def main():
    # Load configuration
    config = get_config()
    
    if not config.get('enabled', True):
        sys.exit(0)
    
    # Read the message from stdin or arguments
    if len(sys.argv) > 1:
        message = ' '.join(sys.argv[1:])
    else:
        message = sys.stdin.read()
    
    # Determine message type and play appropriate sound
    msg_type, sound, volume = check_message_type(message)
    
    if sound:
        # Use detected volume or fall back to config
        final_volume = volume if volume else config.get('volume', 0.5)
        play_sound(sound, final_volume)
    
    # Always exit successfully to not interrupt Claude
    sys.exit(0)

if __name__ == "__main__":
    main()