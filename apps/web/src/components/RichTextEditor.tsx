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
import { useTranslation } from 'react-i18next'

interface PropsEditor {
  editor: Editor | null
}

export default function RichTextEditor({ editor }: PropsEditor) {
  const { t } = useTranslation()
  return <RichTextEditorProvider editor={editor}>
    <RichTextField
      controls={
        <MenuControlsContainer>
          <MenuButtonUndo tooltipLabel={t('editor.undo')} />
          <MenuButtonRedo tooltipLabel={t('editor.redo')} />
          <MenuDivider />
          <MenuSelectHeading tooltipTitle={t('editor.heading')} />
          <MenuDivider />
          <MenuButtonBold tooltipLabel={t('editor.bold')} />
          <MenuButtonItalic tooltipLabel={t('editor.italic')} />
          <MenuButtonUnderline tooltipLabel={t('editor.underline')} />
          <MenuButtonStrikethrough tooltipLabel={t('editor.strikethrough')} />
          <MenuButtonTextColor tooltipLabel={t('editor.textColor')} />
          <MenuDivider />
          <MenuButtonBulletedList tooltipLabel={t('editor.bulletList')} />
          <MenuButtonOrderedList tooltipLabel={t('editor.orderedList')} />
          <MenuDivider />
          <MenuButtonHorizontalRule tooltipLabel={t('editor.horizontalRule')} />
          <MenuBar>
            <MenuButtonAlignLeft tooltipLabel={t('editor.alignLeft')} />
            <MenuButtonAlignCenter tooltipLabel={t('editor.alignCenter')} />
            <MenuButtonAlignRight tooltipLabel={t('editor.alignRight')} />
          </MenuBar>
          <MenuDivider />
          <MenuButtonCode tooltipLabel={t('editor.code')} />
          <MenuButtonCodeBlock tooltipLabel={t('editor.codeBlock')} />
          <VoiceMenuButton editor={editor} />
        </MenuControlsContainer>
      }
    />
  </RichTextEditorProvider>
}