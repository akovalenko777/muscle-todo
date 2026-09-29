import type { Editor } from '@tiptap/core'
import {
  MenuBar,
  MenuButtonAlignCenter,
  MenuButtonAlignLeft,
  MenuButtonAlignRight,
  MenuButtonBold,
  MenuButtonBulletedList,
  MenuButtonCode,
  MenuButtonCodeBlock,
  MenuButtonHorizontalRule,
  MenuButtonItalic,
  MenuButtonOrderedList,
  MenuButtonRedo,
  MenuButtonStrikethrough,
  MenuButtonTextColor,
  MenuButtonUnderline,
  MenuButtonUndo,
  MenuControlsContainer,
  MenuDivider,
  MenuSelectHeading,
  RichTextEditorProvider,
  RichTextField,
} from "mui-tiptap";
import VoiceMenuButton from './VoiceMenuButton';

interface PropsEditor {
  editor: Editor | null
}

export default function RichTextEditor({ editor }: PropsEditor) {
  return <RichTextEditorProvider editor={editor}>
    <RichTextField
      controls={
        <MenuControlsContainer>
          <MenuButtonUndo tooltipLabel='Відмінити' />
          <MenuButtonRedo tooltipLabel='Повернути' />
          <MenuDivider />
          <MenuSelectHeading tooltipTitle='Стиль тексту' />
          <MenuDivider />
          <MenuButtonBold tooltipLabel='Напівжирний' />
          <MenuButtonItalic tooltipLabel='Курсив' />
          <MenuButtonUnderline tooltipLabel='Підкреслений' />
          <MenuButtonStrikethrough tooltipLabel='Закреслений' />
          <MenuButtonTextColor tooltipLabel='Колір тексту' />
          <MenuDivider />
          <MenuButtonBulletedList tooltipLabel='Маркований список' />
          <MenuButtonOrderedList tooltipLabel='Нумерований список' />
          <MenuDivider />
          <MenuButtonHorizontalRule tooltipLabel='Горизорнтальний роздільний' />
          <MenuBar>
            <MenuButtonAlignLeft tooltipLabel='По лівому краю' />
            <MenuButtonAlignCenter tooltipLabel='По центру' />
            <MenuButtonAlignRight tooltipLabel='По правому краю' />
          </MenuBar>
          <MenuDivider />
          <MenuButtonCode tooltipLabel='Рядок коду' />
          <MenuButtonCodeBlock tooltipLabel='Блок коду' />
          <VoiceMenuButton editor={editor} />
        </MenuControlsContainer>
      }
    />
  </RichTextEditorProvider>
}