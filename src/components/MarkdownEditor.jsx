import { useMemo } from 'react'
import SimpleMDE from 'react-simplemde-editor'
import 'easymde/dist/easymde.min.css'

function MarkdownEditor({ value, onChange, placeholder = 'Enter text...' }) {
  const options = useMemo(() => {
    return {
      spellChecker: false,
      placeholder: placeholder,
      toolbar: [
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
      }
    }
  }, [placeholder])

  return (
    <SimpleMDE
      value={value}
      onChange={onChange}
      options={options}
    />
  )
}

export default MarkdownEditor
