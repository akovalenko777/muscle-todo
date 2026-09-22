import { TextField, IconButton, InputAdornment, type TextFieldProps } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import { useEffect } from 'react';
import { useSpeechToText } from '../hooks/useSpeechToText';

interface VoiceTextFieldProps extends Omit<TextFieldProps, 'value' | 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

export default function VoiceTextField({ value, onChange, ...textFieldProps }: VoiceTextFieldProps) {
  const { isListening, transcript, startListening, stopListening, isSupported } = useSpeechToText();

  useEffect(() => {
    if(transcript !== '') onChange(transcript)
  }, [transcript, onChange]);

  return (
    <TextField
      {...textFieldProps}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      slotProps={{
        input: {
          endAdornment: isSupported ? (
            <InputAdornment position="end">
              <IconButton
                onMouseDown={() => startListening()}
                onMouseUp={() => stopListening()}
                onMouseLeave={() => { if(isListening) stopListening()}}
                onTouchStart={() => startListening()}
                onTouchEnd={() => stopListening()}
                edge="end"
              >
                {isListening ? <MicOffIcon /> : <MicIcon />}
              </IconButton>
            </InputAdornment>
          ) : undefined,
        },
      }}
    />
  );
}