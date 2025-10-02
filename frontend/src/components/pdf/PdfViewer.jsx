import { useState, useRef, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { ZoomIn, ZoomOut, Download, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

const PdfViewer = ({ pdf_url, document_title }) => {
  const [num_pages, set_num_pages] = useState(null)
  const [current_page, set_current_page] = useState(1)
  const [scale, set_scale] = useState(1.2)
  const [page_input, set_page_input] = useState('')
  const [search_text, set_search_text] = useState('')
  const [search_matches, set_search_matches] = useState([])
  const [current_match_index, set_current_match_index] = useState(0)
  const [pdf_document, set_pdf_document] = useState(null)

  const container_ref = useRef(null)
  const page_refs = useRef({})

  const on_document_load_success = (pdf) => {
    set_num_pages(pdf.numPages)
    set_pdf_document(pdf)
  }

  // Track current visible page with IntersectionObserver
  useEffect(() => {
    if (!num_pages) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const page = parseInt(entry.target.dataset.page)
            set_current_page(page)
          }
        })
      },
      {
        root: container_ref.current,
        threshold: 0.5,
      }
    )

    Object.values(page_refs.current).forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [num_pages])

  // Clear highlights when search text changes
  useEffect(() => {
    if (!search_text) {
      document.querySelectorAll('.pdf-highlight-wrapper').forEach(wrapper => {
        const parent = wrapper.parentNode
        const text = wrapper.textContent
        const text_node = document.createTextNode(text)
        parent.replaceChild(text_node, wrapper)
        parent.normalize()
      })
      set_search_matches([])
      set_current_match_index(0)
    }
  }, [search_text])

  const zoom_in = () => {
    set_scale(prev => Math.min(prev + 0.2, 3.0))
  }

  const zoom_out = () => {
    set_scale(prev => Math.max(prev - 0.2, 0.5))
  }

  const jump_to_page = (page_number) => {
    const page = parseInt(page_number)
    if (page >= 1 && page <= num_pages) {
      const page_element = page_refs.current[page]
      if (page_element) {
        page_element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  const handle_page_submit = (e) => {
    e.preventDefault()
    if (page_input) {
      jump_to_page(page_input)
      set_page_input('')
    }
  }

  // Search through PDF text content
  const search_in_pdf = async () => {
    if (!search_text.trim() || !pdf_document) return

    const matches = []

    // Search through all pages
    for (let page_num = 1; page_num <= num_pages; page_num++) {
      const page = await pdf_document.getPage(page_num)
      const text_content = await page.getTextContent()
      const text = text_content.items.map(item => item.str).join(' ')

      // Find all matches in this page
      const search_regex = new RegExp(search_text, 'gi')
      let match
      while ((match = search_regex.exec(text)) !== null) {
        matches.push({ page: page_num, index: match.index })
      }
    }

    set_search_matches(matches)
    set_current_match_index(matches.length > 0 ? 1 : 0)

    // Highlight first match (will scroll to it)
    if (matches.length > 0) {
      setTimeout(() => highlight_current_match(), 200)
    }
  }

  const handle_search = () => {
    search_in_pdf()
  }

  const handle_search_next = () => {
    if (search_matches.length === 0) return

    const next_index = current_match_index % search_matches.length + 1
    set_current_match_index(next_index)
    // Highlight will scroll to the element
    setTimeout(() => highlight_current_match(), 50)
  }

  const handle_search_prev = () => {
    if (search_matches.length === 0) return

    const prev_index = current_match_index === 1 ? search_matches.length : current_match_index - 1
    set_current_match_index(prev_index)
    // Highlight will scroll to the element
    setTimeout(() => highlight_current_match(), 50)
  }

  const highlight_current_match = () => {
    // Remove previous highlights and restore original content
    document.querySelectorAll('.pdf-highlight-wrapper').forEach(wrapper => {
      const parent = wrapper.parentNode
      const text = wrapper.textContent
      const text_node = document.createTextNode(text)
      parent.replaceChild(text_node, wrapper)
      parent.normalize() // Merge adjacent text nodes
    })

    if (search_matches.length === 0 || !search_text) return

    const search_regex = new RegExp(`(${search_text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    let match_counter = 0
    let current_match_element = null

    // Highlight all matches
    const text_layers = document.querySelectorAll('.react-pdf__Page__textContent')
    text_layers.forEach(text_layer => {
      const text_spans = text_layer.querySelectorAll('span')
      text_spans.forEach(span => {
        const text = span.textContent
        if (text && search_regex.test(text)) {
          // Reset regex lastIndex
          search_regex.lastIndex = 0

          // Replace text with highlighted version
          const highlighted_html = text.replace(search_regex, (match) => {
            match_counter++
            const is_current = match_counter === current_match_index
            return `<mark class="pdf-highlight-wrapper ${is_current ? 'pdf-search-highlight-current' : 'pdf-search-highlight'}" data-match-index="${match_counter}">${match}</mark>`
          })

          span.innerHTML = highlighted_html
        }
      })
    })

    // Scroll to the current match
    setTimeout(() => {
      const current_highlight = document.querySelector('.pdf-search-highlight-current')
      if (current_highlight) {
        current_highlight.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 100)
  }

  const download_pdf = () => {
    const link = document.createElement('a')
    link.href = pdf_url
    link.download = `${document_title || 'document'}.pdf`
    link.click()
  }

  return (
    <div className="h-full flex flex-col bg-secondary-50 dark:bg-secondary-950 rounded-xl overflow-hidden">
      <style>{`
        .pdf-highlight-wrapper {
          padding: 0 !important;
          margin: 0 !important;
          border: none !important;
        }
        .pdf-search-highlight {
          background-color: rgba(74, 124, 84, 0.3) !important;
          color: inherit !important;
          border-radius: 2px;
          padding: 2px 1px;
        }
        .pdf-search-highlight-current {
          background-color: rgba(74, 124, 84, 0.6) !important;
          color: inherit !important;
          outline: 2px solid #4a7c54;
          outline-offset: 1px;
        }
      `}</style>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-secondary-900/80 backdrop-blur-sm border-b border-white/80 dark:border-secondary-600/50 rounded-t-xl">
        {/* Left - Page Jump */}
        <div className="flex items-center space-x-2">
          <form onSubmit={handle_page_submit} className="flex items-center space-x-2">
            <input
              type="number"
              min="1"
              max={num_pages || 1}
              value={page_input}
              onChange={(e) => set_page_input(e.target.value)}
              placeholder={`${current_page}`}
              className="w-14 px-3 py-1.5 bg-secondary-100 dark:bg-secondary-800 rounded-lg text-sm font-reddit-sans text-text-light text-center focus:outline-none focus:ring-2 focus:ring-primary-600 border-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-text-muted"
            />
            <span className="text-sm font-reddit-sans text-text-muted">
              / {num_pages || '...'}
            </span>
          </form>
        </div>

        {/* Center - Search */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-secondary-100 dark:bg-secondary-800 rounded-lg overflow-hidden">
            <Search className="w-4 h-4 text-text-muted ml-3" />
            <input
              type="text"
              value={search_text}
              onChange={(e) => set_search_text(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handle_search()}
              placeholder="Search in document..."
              className="w-48 px-3 py-1.5 bg-transparent text-sm font-reddit-sans text-text-light focus:outline-none border-0"
            />
          </div>
          {search_matches.length > 0 && (
            <div className="px-2 py-1 bg-secondary-100 dark:bg-secondary-800 rounded-lg">
              <span className="text-xs font-reddit-sans text-text-light">
                {current_match_index}/{search_matches.length}
              </span>
            </div>
          )}
          {search_text && (
            <>
              <button
                onClick={handle_search_prev}
                disabled={search_matches.length === 0}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-light hover:bg-secondary-100 dark:hover:bg-secondary-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
                aria-label="Previous match"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handle_search_next}
                disabled={search_matches.length === 0}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-light hover:bg-secondary-100 dark:hover:bg-secondary-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
                aria-label="Next match"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Right - Zoom & Download */}
        <div className="flex items-center space-x-2">
          <button
            onClick={zoom_out}
            className="p-2 rounded-lg text-text-muted hover:text-text-light hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors duration-200"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>

          <div className="px-3 py-1 bg-secondary-100 dark:bg-secondary-800 rounded-lg min-w-[60px] text-center">
            <span className="text-sm font-reddit-sans text-text-light">
              {Math.round(scale * 100)}%
            </span>
          </div>

          <button
            onClick={zoom_in}
            className="p-2 rounded-lg text-text-muted hover:text-text-light hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors duration-200"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-secondary-300 dark:bg-secondary-600 mx-2" />

          <button
            onClick={download_pdf}
            className="p-2 rounded-lg text-text-muted hover:text-text-light hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors duration-200"
            aria-label="Download PDF"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* PDF Content - Continuous Scroll */}
      <div ref={container_ref} className="flex-1 overflow-auto flex justify-center p-6">
        <Document
          file={pdf_url}
          onLoadSuccess={on_document_load_success}
          className="flex flex-col gap-4"
        >
          {num_pages && Array.from(new Array(num_pages), (el, index) => {
            const page_num = index + 1
            return (
              <div
                key={`page_${page_num}`}
                ref={(el) => (page_refs.current[page_num] = el)}
                data-page={page_num}
                className="shadow-xl"
              >
                <Page
                  pageNumber={page_num}
                  scale={scale}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className="bg-white"
                />
              </div>
            )
          })}
        </Document>
      </div>
    </div>
  )
}

export default PdfViewer
