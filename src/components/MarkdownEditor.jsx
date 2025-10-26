import { useMemo } from 'react'
import SimpleMDE from 'react-simplemde-editor'
import 'easymde/dist/easymde.min.css'

function MarkdownEditor({ value, onChange, placeholder = 'Enter text...', disabled = false, maxHeight = null
 }) {
  const options = useMemo(() => {
    return {
      spellChecker: false,
      placeholder: placeholder,
      maxHeight: maxHeight,
      toolbar: disabled ? false : [
        'bold',
        'italic',
        'heading',
        '|',
        'quote',
        'unordered-list',
        'ordered-list',
        '|',
        'link',
        'image',
        '|',
        'preview',
        'side-by-side',
        'fullscreen',
        '|',
        'guide'
      ],
      status: false,
      autosave: {
        enabled: false
      },
      readOnly: disabled
    }
  }, [placeholder, disabled])

  return (
    <SimpleMDE
      value={value}
      onChange={onChange}
      options={options}
    />
  )
}

export default MarkdownEditor
