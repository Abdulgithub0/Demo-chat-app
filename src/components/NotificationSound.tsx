'use client';

import React, { useRef, useEffect } from 'react';

interface NotificationSoundProps {
  play: boolean;
  onPlayed?: () => void;
}

// Simple notification sound as a data URI
// This is a short "ding" sound encoded as base64 data
const NOTIFICATION_SOUND_DATA_URI = 'data:audio/wav;base64,UklGRnQGAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YU8GAACA/4b/i/+X/6P/r//A/9X/8/8LAyEEPAVEBh4Hsf9B/vX8sfto+kz5R/hX91v2bfV19YD1i/WL9Xj1S/UQ9dT0nfRv9E70Y/Sh9PL0YfXX9Vj2zfYu94z35vcV+Fb4mvjc+B35Yfmk+ez5N/qJ+uL6QPug+wj8cPzX/Db9kv3i/SL+V/6D/qr+0P7y/hX/QP9q/5X/xP/0/ysAYwCcANYAEgFQAY0BygEIAkYChALCAv8CPQNxA6EDzwP1AxcEMARHBFYEYgRtBHYEgASJBI4EkQSQBI0EhgR7BG0EXQRKBDYEIAQKBPMDzgOoA34DTwMeA+wCuAKDAk0CFALaAZ8BYwEnAesAsgB4ADwAAADI/4z/Uf8V/9j+nP5i/if+7v23/YD9TP0Y/eX8tPyF/Fj8LPwB/Nf7sPuK+2X7QPsc+/j61/q1+pX6dvpY+jz6Ivr/+d/5wPmj+Yb5a/lQ+Tf5IPkK+fb46Pjc+NL4yvjE+L/4vfi++ML4yPjQ+Nj44/jw+P74DvkA+Qz5Gvkp+Tj5SPlZ+Wv5fvmS+ab5u/nR+ej5APkY+TD5SPli+X35mvmz+c/56/kI+ib6RPpk+oP6pPrF+ub6CPsp+0v7bvuR+7X72PsA/Cf8Ufx7/Kb80vz//Cz9Wf2G/bP94/0S/kH+cf6h/tH+Av8z/2T/lf/G//f/KQBbAI0AvwDxACMBVQGHAbkB6wEdAk8CgQKyAuMCFANEA3QDpAPTA/4DJwROBHQEmAS7BN4EAAUhBUEFYAV/BZ0FugXWBfEFDAYmBj8GVwZuBoUGmwawBsQG1wbpBvoGCgcZBycHNQdCB04HWQdjB2wHdAd7B4EHhgeKB40HjweQB5AHjweNB4oHhgeCB30HeAdzB20HZgdfB1cHTwdGB0AHOQcxBykHIQcYBw8HBgf9BvMG6QbfBtQGygbABrUGqgafBpQGiQZ+BnMGZwZcBlAGRAY4BiwGIAYUBggG/AXwBeQF2AXMBcAFtAWoBZwFkAWEBXgFbAVgBVQFSAU8BTAFJAUYBQoF/gTyBOYE2gTOBMIEtgSqBJ4EkgSGBHoEbgRiBFYESgQ+BDIEJgQaBBAEBAT4A+wD4APUA8gDvAOwA6QDmAOMA4ADdANoA1wDUANEAzgDLAMgAxQDCAP8AvAC5ALYAsoC2ALsAv4CEAMiAzQDRgNYA2oDfAOOA6ADsgPEA9YD6AP6AwwEHgQwBEIEVARmBHgEigScBK4EwATSBOQE9gQIBRoFLAU+BVAFYgV0BYYFmAWqBbwFzgXgBfIFBAYWBigGOgZMBl4GcAaCBpQGpga4BsoG3AbwBgIHFAcmBzgHSgdcB24HgAeSB6QHtgfIB9oH7Af+BxAIIgg0CEYIWAhqCHwIjgiaCKwIvgjQCOII9AgGCRgJKgk8CU4JYAlyCoQKlgqoCroKzAreKvAqAisUKyYrOCtKK1wrbiuAK5IrpCu2K8gr2ivsK/4rECwiLDQsRixYLGoshCyWLKgsyizcLO4sAC0SLSQtNi1ILVotbC1+LZAtoi20LcYt2C3qLfwuDi4gLjIuRC5WLmgueC6KLpwuri7ALtIu5C72LwgwGjAsMD4wUDBiMHQwhjCYMKowvDDOMOAw8jEEMRYxKDE6MUwxXjFwMYIxlDGmMbgxyjHcMe4yADISMiQyNjJIMloybjKAMpIypDK2Msgw2jDsMPwwDjEgMTIxRDFWMWgxejGMMZ4xsDHCMdQx5jH4MgoyHDIuMkAyUjJkMnYyiDKaMqwyvjLQMuIy9DMGMxgzKjM8M04zYDNyM4QzljOoM7oz7DMONCAzMjNEM1YzaDN6M4wznjOwM8Iz1DPmM/g0CjQcNC40QDRSNGQzdjOIM5ozrDO+M9Az4jP0NAY0GDQqNDw0TjRgNHI0hDSWNKg0ujTMNN407DT+NRA1IjU0NUY1WDVqNXw1jjWgNbI1xDXWNeg1+jYMNh42MDZCNlQ2ZjZ4Noo2nDauNsA20jbkNvY3CDcaNyw3PjdQN2I3dDeGN5g3qje8N8430jfkN/Y4CDgaOCw4PjhQOGI4dDiGOJg4qji8OM443DjuOQA5EjkkOTY5SDlaOWw5fjmQOaI5tDnGOdg56jn8Og46IDoyOkQ6VjpoOnrFAA==';

const NotificationSound: React.FC<NotificationSoundProps> = ({ play, onPlayed }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (play && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play()
        .then(() => {
          if (onPlayed) onPlayed();
        })
        .catch(error => {
          console.error('Error playing notification sound:', error);
          // Fallback: Create and play audio using Web Audio API
          try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 0.3);

            gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.3);

            // Call onPlayed after the sound is done
            setTimeout(() => {
              if (onPlayed) onPlayed();
            }, 300);
          } catch (fallbackError) {
            console.error('Fallback audio also failed:', fallbackError);
            // Still call onPlayed to reset the state
            if (onPlayed) onPlayed();
          }
        });
    }
  }, [play, onPlayed]);

  return (
    <audio
      ref={audioRef}
      src={NOTIFICATION_SOUND_DATA_URI}
      preload="auto"
      style={{ display: 'none' }}
    />
  );
};

export default NotificationSound;
