'use client';

import React, { useEffect, useRef } from 'react';
import { Howl } from 'howler';

interface NotificationSoundProps {
  play: boolean;
  onPlayed?: () => void;
}

// Sound URL - using a notification sound
const NOTIFICATION_SOUND_URL = '/notification.mp3';

const NotificationSound: React.FC<NotificationSoundProps> = ({ play, onPlayed }) => {
  const soundRef = useRef<Howl | null>(null);

  // Initialize the Howl instance once
  useEffect(() => {
    soundRef.current = new Howl({
      src: [NOTIFICATION_SOUND_URL],
      volume: 0.5,
      preload: true,
      html5: true, // Use HTML5 Audio to reduce latency
      onend: () => {
        console.log('Notification sound finished playing');
      },
      onloaderror: (id, error) => {
        console.error('Error loading notification sound:', error);
      },
      onplayerror: (id, error) => {
        console.error('Error playing notification sound:', error);
        // Still call onPlayed to reset the state
        if (onPlayed) onPlayed();
      }
    });

    // Cleanup on unmount
    return () => {
      if (soundRef.current) {
        soundRef.current.unload();
      }
    };
  }, []);

  // Play the sound when the play prop changes to true
  useEffect(() => {
    if (play && soundRef.current) {
      // Stop any currently playing instances
      soundRef.current.stop();

      // Play the sound
      soundRef.current.play();

      // Call onPlayed callback
      if (onPlayed) onPlayed();
    }
  }, [play, onPlayed]);

  // No need to render anything since Howler doesn't require DOM elements
  return null;
};

export default NotificationSound;
