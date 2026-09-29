import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import { Color, TextStyle } from '@tiptap/extension-text-style'

export const editorExtensions = [
  StarterKit.configure({
    link: false,
    blockquote: false,
  }),
  Color,
  TextStyle,
  TextAlign.configure({ types: ['heading', 'paragraph'] })
]