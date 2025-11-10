# My Brain - Input Source Types

This document lists all input source types that can be captured into Axon's "second brain" system.

**Note**: This document focuses on **INPUTS** (raw data users put INTO the system), not outputs (flashcards, processed notes, etc. that the system generates).

---

## 📚 Reading & Literature

### ✅ Implemented

- **readwise_highlight** - Highlights from Readwise (Kindle, articles, web pages, PDFs)

### 📋 Planned

- **readwise_reader_document** - Full articles/documents from Readwise Reader
- **kindle_highlight** - Direct Kindle highlights (if not using Readwise)
- **apple_books_highlight** - Apple Books highlights
- **google_books_highlight** - Google Books highlights
- **kobo_highlight** - Kobo e-reader highlights

### 🔄 Complex (Future)

- **research_paper** - Full academic papers with citations
- **epub_book** - Full EPUB e-book files
- **pdf_book** - Full PDF book files

---

## 📝 Text & Notes

### 📋 Planned

- **manual_text** - Manual text notes (plain text, rich text, markdown)
- **voice_memo** - Voice recordings with transcription
- **meeting_note** - Meeting notes and transcripts
- **code_snippet** - Code blocks and snippets
- **checklist** - Task lists and checklists

---

## 🌐 Web & Online Content

### 📋 Planned

- **web_article** - Full web article captures
- **url_bookmark** - URL/bookmark captures
- **newsletter** - Newsletter content (email-based)
- **social_media_post** - Twitter/X, LinkedIn, Reddit posts
- **forum_comment** - Forum discussions and comments

---

## 📧 Communication

### 📋 Planned

- **email** - Email content and threads
- **slack_message** - Slack messages
- **discord_message** - Discord messages
- **whatsapp_message** - WhatsApp messages
- **telegram_message** - Telegram messages

---

## 🖼️ Visual Content

### 📋 Planned

- **photo_note** - Photos with OCR text extraction
- **screenshot** - Screenshots (desktop, mobile, partial)
- **image_file** - Image files (JPG, PNG, GIF, WebP)
- **handwritten_note** - Scanned handwritten notes
- **diagram** - Diagrams and flowcharts (as images)

---

## 📄 Documents

### 📋 Planned

- **pdf_document** - PDF documents (with text extraction)
- **word_document** - Word documents (.docx, .doc)

### 🔄 Complex (Future)

- **spreadsheet** - Excel/Google Sheets files
- **presentation** - PowerPoint/Google Slides files

---

## 🎥 Multimedia

### 📋 Planned

- **video_transcript** - Video transcripts (YouTube, etc.)
- **video_note** - Notes about videos
- **podcast_transcript** - Podcast episode transcripts
- **podcast_note** - Podcast show notes
- **audio_note** - Audio recordings with transcription

---

## 🗂️ Structured Data

### 📋 Planned

- **annotation** - Text annotations and margin notes
- **template** - Note templates (as input)
- **framework** - Conceptual frameworks (as input)

---

## 🔗 Integrations

### 📋 Planned

- **notion_page** - Notion pages
- **google_drive_file** - Google Drive files
- **dropbox_file** - Dropbox files
- **onedrive_file** - OneDrive files

---

## 📱 Mobile & Native

### 📋 Planned

- **ios_share** - iOS Share Sheet captures
- **android_share** - Android Share captures
- **browser_extension** - Browser extension captures (Chrome, Firefox, Safari)

---

## 🎨 Creative Content

### 🔄 Complex (Future)

- **moodboard** - Visual moodboards
- **mind_map** - Visual mind maps
- **flowchart** - Flowcharts and process diagrams

---

## 📊 Professional

### 📋 Planned

- **business_document** - Business plans, reports
- **client_note** - Client communication notes

---

## 📅 Calendar & Events

### 📋 Planned

- **calendar_event_note** - Notes attached to calendar events
- **meeting_summary** - Meeting summaries

---

## 🔄 Complex Source Types (Future Implementation)

These source types require more complex processing and are deferred for future implementation:

1. **PowerPoint/Google Slides Presentations** - Requires slide extraction, notes parsing
2. **Excel/Google Sheets Spreadsheets** - Requires cell-level data extraction
3. **Full E-books (EPUB/PDF)** - Requires chapter/section parsing, full text processing
4. **Research Papers** - Requires citation parsing, metadata extraction
5. **Visual Mind Maps** - Requires graph structure parsing
6. **Interactive Diagrams** - Requires complex visual parsing
7. **Video Files** - Requires video processing, frame extraction
8. **Audio Files** - Requires audio processing, transcription
9. **Archived Websites** - Requires web archive parsing
10. **Complex PDFs** - Multi-column layouts, forms, scanned documents

---

## Summary

- **Total Input Source Types**: 50+
- **Currently Implemented**: 1 (readwise_highlight)
- **Planned**: ~35
- **Complex/Deferred**: ~10
