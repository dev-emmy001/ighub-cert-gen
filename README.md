# IGHub Certificate Automator

An internal web-based workflow tool built for Innovation Growth Hub (IGHub) to automate the generation of student certificates in bulk. 

This project provides a fully visual workflow to upload certificate assets, visually map where dynamic data (e.g. names, dates, courses) should be placed, and batch export the final high-resolution certificates as PDFs.

## ✨ Features

- **Asset Management**: Drag-and-drop zones for uploading your high-res certificate template (`.png` / `.jpg`) and custom brand typography (`.ttf` / `.otf`).
- **Interactive Layout Designer**:
  - **WYSIWYG Canvas**: Click anywhere on your uploaded template to drop a scalable text input.
  - **Drag to Reposition**: Floating handles let you tweak the exact pixel mappings by dragging the font around. 
  - **Live Styling**: Includes an inline colour-picker and font-size controller so you can preview exactly what the final output will look like!
  - **Relative Scaling Logic**: Automatically calculates the coordinate difference between your screen size and the original dimensions to guarantee precise PDF placements.
- **Bulk Export System**: (UI configured) Upload a CSV of student data, process the coordinate logic with `pdf-lib`, and output 50+ certificates in seconds.

## 🛠️ Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router) / React 19
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **PDF Automation**: [pdf-lib](https://pdf-lib.js.org/)
- **Data Parsing**: [PapaParse](https://www.papaparse.com/)
- **Drag & Drop UI**: [react-dropzone](https://react-dropzone.js.org/)

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js 18.x or later installed on your system. 

### Installation
Clone the repository and install the dependencies:

```bash
npm install
```

### Running the App
Start the local development server:

```bash
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 📐 Usage Workflow

1. Move to the **Project Assets** sidebar and upload your `.png` Certificate and native `.ttf` brand font.
2. In the **Styling Controls**, set the text's colour, choose a sensible font size, and provide a dummy name (e.g., *John Doe*).
3. On the **Layout Designer**, click precisely where the baseline of the name should start. You will see a text overlay appear.
4. Tweak the exact position by grabbing the `✥ Drag` handle. If you make a mistake, click `✕` to clear it.
5. In **Data & Export**, upload your CSV with rows for the student names, and hit **Generate**.

---

*Built by IGHub*
