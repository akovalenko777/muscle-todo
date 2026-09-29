import { useSpeechToText } from '../hooks/useSpeechToText';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import { MenuButton, MenuDivider } from 'mui-tiptap';
import type { Editor } from '@tiptap/react';
import { type SyntheticEvent } from 'react';

interface IProps {
  editor: Editor | null
}

export default function VoiceMenuButton({ editor }: IProps) {
  const { isListening, startListening, stopListening, isSupported } = useSpeechToText({ onEnd: (str: string) => {
    if (!str.trim() || !editor) return

    const { from } = editor.state.selection
    const before = editor.state.doc.textBetween(Math.max(0, from - 1), from, '')
    const needsSpace = before !== '' && !/\s/.test(before)

    editor.chain().focus().insertContent({ type: 'text', text: needsSpace ? ' ' + str : str }).run()
  } });

  if (!editor || !isSupported) return null

  const handleStartListening = (event: SyntheticEvent) => {
    event.preventDefault()
    startListening(editor.state.selection.$from.parentOffset === 0)
  }

  return (
    <>
      <MenuDivider />
      <MenuButton
        tooltipLabel='Голосове введення'
        onPointerDown={handleStartListening}
        onPointerUp={() => stopListening()}
        onPointerCancel={() => stopListening()}
        onPointerLeave={() => { if (isListening) stopListening() }}
        // onMouseDown={handleStartListening}
        // onMouseUp={() => stopListening()}
        // onMouseLeave={() => { if (isListening) stopListening() }}
        style={{touchAction: 'none', userSelect: 'none'}}
      >
        {isListening ? <MicOffIcon /> : <MicIcon />}
      </MenuButton>
    </>
  )
}