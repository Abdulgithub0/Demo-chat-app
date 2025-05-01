// This script creates a simple notification sound using the Web Audio API
// Run this in the browser console to generate and download the sound

function generateNotificationSound() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const duration = 0.3; // seconds
  const sampleRate = audioContext.sampleRate;
  const frameCount = sampleRate * duration;
  
  // Create an audio buffer
  const audioBuffer = audioContext.createBuffer(1, frameCount, sampleRate);
  const channelData = audioBuffer.getChannelData(0);
  
  // Generate a simple "ding" sound
  for (let i = 0; i < frameCount; i++) {
    // Frequency decreases over time (from 880Hz to 440Hz)
    const frequency = 880 - (i / frameCount) * 440;
    // Amplitude decreases over time (envelope)
    const amplitude = 0.5 * Math.pow(1 - i / frameCount, 2);
    // Generate a sine wave
    channelData[i] = amplitude * Math.sin(2 * Math.PI * frequency * i / sampleRate);
  }
  
  // Create a source node from the buffer
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  
  // Connect to the audio context destination
  source.connect(audioContext.destination);
  
  // Play the sound
  source.start();
  
  // Export as WAV
  const wavBuffer = bufferToWave(audioBuffer, 0, frameCount);
  const blob = new Blob([wavBuffer], { type: 'audio/wav' });
  const url = URL.createObjectURL(blob);
  
  // Create download link
  const a = document.createElement('a');
  a.href = url;
  a.download = 'notification.wav';
  a.click();
}

// Convert AudioBuffer to WAV format
function bufferToWave(audioBuffer, start, end) {
  const numOfChannels = audioBuffer.numberOfChannels;
  const length = (end - start) * numOfChannels * 2 + 44;
  const buffer = new ArrayBuffer(length);
  const view = new DataView(buffer);
  const sampleRate = audioBuffer.sampleRate;
  
  // Write WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, length - 8, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numOfChannels * 2, true);
  view.setUint16(32, numOfChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, length - 44, true);
  
  // Write audio data
  const channelData = [];
  for (let i = 0; i < numOfChannels; i++) {
    channelData.push(audioBuffer.getChannelData(i));
  }
  
  let offset = 44;
  for (let i = start; i < end; i++) {
    for (let c = 0; c < numOfChannels; c++) {
      const sample = Math.max(-1, Math.min(1, channelData[c][i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
  }
  
  return buffer;
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

// Call the function to generate and download the sound
generateNotificationSound();
