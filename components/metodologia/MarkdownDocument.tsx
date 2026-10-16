import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import './metodologia.css'

interface MarkdownDocumentProps {
  source: string
}

export function MarkdownDocument({ source }: MarkdownDocumentProps) {
  return (
    <div className="metodologia-doc">
      <Markdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          table: ({ node: _node, ...props }) => (
            <div style={{ overflowX: 'auto', margin: '0 0 18px' }}>
              <table {...props} />
            </div>
          ),
        }}
      >
        {source}
      </Markdown>
    </div>
  )
}
